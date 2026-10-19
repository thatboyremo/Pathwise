from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """
    Every AI provider (Gemini, Groq, Ollama...)
    must implement these methods.
    """

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """Generate plain text."""
        pass

    @abstractmethod
    def generate_json(self, prompt: str):
        """Generate structured JSON."""
        pass

    @abstractmethod
    def chat(self, messages):
        """Chat-style completion."""
        pass