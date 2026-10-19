import json
import logging
import os
import re

from groq import Groq

from ai.exceptions import AIProviderError


logger = logging.getLogger(__name__)


class GroqProvider:
    """
    Groq AI provider.

    Provides:
        - generate()
        - generate_json()

    Designed to safely handle:
        - empty responses
        - malformed JSON
        - Markdown JSON fences
        - Groq API errors
        - token-limit failures
        - missing choices
        - missing message content
    """

    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")

        self.model = os.getenv(
            "GROQ_MODEL",
            "llama-3.3-70b-versatile",
        )

        if not self.api_key:
            raise AIProviderError(
                "GROQ_API_KEY is not configured."
            )

        self.client = Groq(
            api_key=self.api_key
        )

    # ============================================================
    # NORMAL TEXT GENERATION
    # ============================================================

    def generate(self, prompt):
        """
        Generate a normal text response from Groq.
        """

        if not prompt or not str(prompt).strip():
            raise AIProviderError(
                "Groq received an empty prompt."
            )

        try:

            response = self.client.chat.completions.create(
                model=self.model,

                messages=[
                    {
                        "role": "user",
                        "content": str(prompt),
                    }
                ],

                temperature=0.2,

                max_completion_tokens=2048,

                include_reasoning=False,
            )

            content = self._extract_content(response)

            if not content:
                raise AIProviderError(
                    "Groq returned an empty message content."
                )

            return content.strip()

        except AIProviderError:
            raise

        except Exception as e:

            logger.exception(
                "Groq text generation failed."
            )

            raise AIProviderError(
                f"Groq request failed: {str(e)}"
            ) from e

    # ============================================================
    # JSON GENERATION
    # ============================================================

    def generate_json(self, prompt):
        """
        Generate and parse a JSON response from Groq.

        Uses Groq's JSON response format and additional
        defensive parsing to prevent application crashes.
        """

        if not prompt or not str(prompt).strip():
            raise AIProviderError(
                "Groq received an empty JSON prompt."
            )

        try:

            response = self.client.chat.completions.create(
                model=self.model,

                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a JSON API. "
                            "Return ONLY one valid JSON object. "
                            "Do not use Markdown. "
                            "Do not use code fences. "
                            "Do not include explanations. "
                            "Do not include text before or after JSON."
                        ),
                    },
                    {
                        "role": "user",
                        "content": str(prompt),
                    },
                ],

                temperature=0.1,

                # Important:
                # Give the model enough room to finish the JSON,
                # but prevent unnecessarily huge generations.
                max_completion_tokens=4096,

                response_format={
                    "type": "json_object"
                },

                include_reasoning=False,
            )

            content = self._extract_content(response)

            # ----------------------------------------------------
            # Empty response protection
            # ----------------------------------------------------

            if not content:

                logger.error(
                    "Groq returned empty JSON content."
                )

                raise AIProviderError(
                    "Groq returned an empty message content."
                )

            content = content.strip()

            logger.info(
                "Groq JSON response received (%s characters).",
                len(content),
            )

            # ----------------------------------------------------
            # Clean accidental Markdown fences
            # ----------------------------------------------------

            content = self._clean_json_response(
                content
            )

            # ----------------------------------------------------
            # Parse JSON
            # ----------------------------------------------------

            try:

                data = json.loads(content)

            except json.JSONDecodeError as e:

                logger.error(
                    "Groq returned invalid JSON."
                )

                logger.error(
                    "Raw content: %s",
                    content,
                )

                # Try extracting the JSON object if Groq
                # accidentally included extra text.
                extracted = self._extract_json_object(
                    content
                )

                if extracted:

                    try:

                        data = json.loads(
                            extracted
                        )

                    except json.JSONDecodeError:

                        raise AIProviderError(
                            "Groq returned invalid JSON: "
                            f"{str(e)}"
                        ) from e

                else:

                    raise AIProviderError(
                        "Groq returned invalid JSON: "
                        f"{str(e)}"
                    ) from e

            # ----------------------------------------------------
            # Validate result
            # ----------------------------------------------------

            if not isinstance(data, dict):

                raise AIProviderError(
                    "Groq JSON response must be an object."
                )

            return data

        except AIProviderError:
            raise

        except Exception as e:

            logger.exception(
                "Groq JSON generation failed."
            )

            error_message = str(e)

            # Give a much clearer message when Groq's
            # structured JSON generation fails.
            if (
                "json_validate_failed"
                in error_message.lower()
            ):
                raise AIProviderError(
                    "Groq failed to generate valid JSON. "
                    "The response may have exceeded the "
                    "completion token limit. "
                    "Try reducing the prompt/output size."
                ) from e

            if (
                "max completion tokens"
                in error_message.lower()
            ):
                raise AIProviderError(
                    "Groq reached the completion token limit "
                    "before generating valid JSON."
                ) from e

            raise AIProviderError(
                f"Groq request failed: {error_message}"
            ) from e

    # ============================================================
    # EXTRACT MESSAGE CONTENT
    # ============================================================

    @staticmethod
    def _extract_content(response):
        """
        Safely extract message.content from a Groq response.
        """

        if response is None:
            return None

        choices = getattr(
            response,
            "choices",
            None,
        )

        if not choices:
            return None

        choice = choices[0]

        message = getattr(
            choice,
            "message",
            None,
        )

        if message is None:
            return None

        content = getattr(
            message,
            "content",
            None,
        )

        if content is None:
            return None

        if isinstance(content, str):
            return content

        # Defensive handling in case the SDK returns
        # an unexpected content structure.
        try:

            return str(content)

        except Exception:
            return None

    # ============================================================
    # CLEAN JSON
    # ============================================================

    @staticmethod
    def _clean_json_response(content):
        """
        Remove accidental Markdown fences and whitespace.
        """

        content = content.strip()

        # ```json ... ```
        if content.startswith("```json"):

            content = content[
                len("```json"):
            ].strip()

        # ``` ... ```
        elif content.startswith("```"):

            content = content[
                len("```"):
            ].strip()

        if content.endswith("```"):

            content = content[
                :-len("```")
            ].strip()

        return content

    # ============================================================
    # EXTRACT JSON OBJECT
    # ============================================================

    @staticmethod
    def _extract_json_object(content):
        """
        Attempt to extract a JSON object from a response
        that contains extra text.

        Example:

        Here is the result:
        {"score": 90}

        becomes:

        {"score": 90}
        """

        if not content:
            return None

        start = content.find("{")
        end = content.rfind("}")

        if start == -1 or end == -1:
            return None

        if end <= start:
            return None

        candidate = content[
            start:end + 1
        ].strip()

        try:

            json.loads(candidate)

            return candidate

        except json.JSONDecodeError:

            return None