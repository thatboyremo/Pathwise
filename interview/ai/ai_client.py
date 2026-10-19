import json
import logging

from django.conf import settings
from google import genai
from google.genai.errors import ClientError

logger = logging.getLogger(__name__)


class GeminiClient:

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        self.model = getattr(
            settings,
            "GEMINI_MODEL",
            "gemini-2.5-flash",
        )

    def generate(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_output_tokens: int = 4096,
    ):

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config={
                    "temperature": temperature,
                    "max_output_tokens": max_output_tokens,
                },
            )

            return response.text.strip()

        except ClientError as e:
            logger.exception("Gemini Client Error")

            print("=" * 80)
            print("CLIENT ERROR")
            print(e)
            print(f"Status Code: {getattr(e, 'status_code', 'Unknown')}")
            print("=" * 80)

            raise

        except Exception as e:
            logger.exception("Gemini Error")

            print("=" * 80)
            print("GENERAL ERROR")
            print(e)
            print(type(e))
            print("=" * 80)

            raise

    def generate_json(
        self,
        prompt: str,
        temperature: float = 0.4,
    ):
        """
        Forces Gemini to return JSON.
        """

        prompt += """

Return ONLY valid JSON.

Do not wrap inside markdown.

Do not explain anything.

"""

        text = self.generate(
            prompt,
            temperature=temperature,
        )

        if text is None:
            return None

        text = (
            text.replace("```json", "")
                .replace("```", "")
                .strip()
        )

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            logger.exception("Invalid JSON returned by Gemini")
            return None
    
    # ----------------------------------------------------
# Singleton Client
# ----------------------------------------------------

_client = GeminiClient()


def generate_text(
    prompt: str,
    temperature: float = 0.7,
):
    return _client.generate(
        prompt=prompt,
        temperature=temperature,
    )


def generate_json(
    prompt: str,
    temperature: float = 0.4,
):
    return _client.generate_json(
        prompt=prompt,
        temperature=temperature,
    )