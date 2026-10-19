from ai.base import BaseProvider
from ai.exceptions import AIProviderError


class OpenAIProvider(BaseProvider):

    def generate(self, prompt: str):
        raise AIProviderError(
            "OpenAI provider not implemented."
        )

    def generate_json(self, prompt: str):
        raise AIProviderError(
            "OpenAI provider not implemented."
        )

    def chat(self, messages):
        raise AIProviderError(
            "OpenAI provider not implemented."
        )