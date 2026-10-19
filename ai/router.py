from django.conf import settings


class AI:

    provider = None

    @classmethod
    def get_provider(cls):

        if cls.provider:
            return cls.provider

        provider = getattr(
            settings,
            "AI_PROVIDER",
            "groq",
        ).lower()

        if provider == "groq":

            from ai.providers.groq import GroqProvider

            cls.provider = GroqProvider()

        elif provider == "gemini":

            from ai.providers.gemini import GeminiProvider

            cls.provider = GeminiProvider()

        elif provider == "openai":

            from ai.providers.openai import OpenAIProvider

            cls.provider = OpenAIProvider()

        elif provider == "ollama":

            from ai.providers.ollama import OllamaProvider

            cls.provider = OllamaProvider()

        else:

            raise ValueError(
                f"Unknown AI Provider: {provider}"
            )

        return cls.provider

    @classmethod
    def generate(cls, prompt):

        return cls.get_provider().generate(prompt)

    @classmethod
    def generate_json(cls, prompt):

        return cls.get_provider().generate_json(prompt)

    @classmethod
    def chat(cls, messages):

        return cls.get_provider().chat(messages)