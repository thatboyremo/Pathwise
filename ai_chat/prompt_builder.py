from .models import ChatMessage


SYSTEM_PROMPT = """
You are Nova, an intelligent AI Career Assistant.

Your responsibilities include helping users with:

- Career guidance
- Resume and CV review
- Cover letters
- Interview preparation
- Programming
- Software engineering
- AI & Data Science
- Scholarships
- University applications
- Research
- Career planning
- Job search advice

Rules:

- Give clear, professional answers.
- Explain difficult concepts simply.
- When writing code, include comments.
- Use markdown formatting.
- Be encouraging and constructive.
- If you don't know something, say so honestly.
"""


def build_chat_prompt(session, history_limit=20):
    """
    Build the conversation history for the AI.

    Returns a list like:

    [
        {"role":"system","content":"..."},
        {"role":"user","content":"..."},
        {"role":"assistant","content":"..."},
        ...
    ]
    """

    prompt = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    # Get the latest conversation history
    history = (
        ChatMessage.objects
        .filter(session=session)
        .order_by("-created_at")[:history_limit]
    )

    # Reverse so messages are oldest → newest
    history = list(reversed(history))

    for message in history:
        prompt.append(
            {
                "role": message.role,
                "content": message.content,
            }
        )

    return prompt