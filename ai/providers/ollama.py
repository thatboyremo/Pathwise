from ai.base import BaseProvider
from ai.exceptions import AIProviderError


class OllamaProvider(BaseProvider):

    def generate(self, prompt: str):
        raise AIProviderError(
            "Ollama provider not implemented."
        )

    def generate_json(self, prompt: str):
        raise AIProviderError(
            "Ollama provider not implemented."
        )

    def chat(self, messages):
        raise AIProviderError(
            "Ollama provider not implemented."
        )