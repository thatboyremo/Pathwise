from ai.router import AI


class CareerChatService:

    def generate_reply(
        self,
        messages,
    ):

        return AI.generate(
            messages=messages,
        )
    
from django.db import transaction

from ai.router import AI

from .models import (
    ChatSession,
    ChatMessage,
)

from .prompt_builder import build_chat_prompt


class ChatService:
    """
    Main service for Nova AI Chat.

    Responsibilities:

    - Save user messages
    - Build conversation memory
    - Ask the AI
    - Save AI responses
    """

    def __init__(self, session: ChatSession):

        self.session = session

    # ==========================================
    # Send Message
    # ==========================================

    @transaction.atomic
    def send_message(self, user_message):

        # ----------------------------------
        # Save user's message
        # ----------------------------------

        ChatMessage.objects.create(

            session=self.session,

            role="user",

            content=user_message,

        )

        # ----------------------------------
        # Build conversation history
        # ----------------------------------

        messages = build_chat_prompt(

            self.session,

        )

        # ----------------------------------
        # Ask Nova
        # ----------------------------------

        ai_reply = AI.chat(messages)

        # ----------------------------------
        # Save assistant response
        # ----------------------------------

        assistant = ChatMessage.objects.create(

            session=self.session,

            role="assistant",

            content=ai_reply,

        )

        # ----------------------------------
        # Auto-generate title
        # ----------------------------------

        if self.session.title == "New Chat":

            self.session.title = self.generate_title(
                user_message
            )

            self.session.save()

        return assistant

    # ==========================================
    # Auto Title
    # ==========================================

    def generate_title(self, text):

        words = text.strip().split()

        if len(words) <= 6:

            return text

        return " ".join(words[:6]) + "..."