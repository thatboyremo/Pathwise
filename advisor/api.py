import os
from groq import Groq
from rest_framework.decorators import api_view
from rest_framework.response import Response

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


@api_view(["POST"])
def advisor_chat(request):

    message = request.data.get("message")

    completion = client.chat.completions.create(
        model=os.getenv(
            "GROQ_MODEL",
            "openai/gpt-oss-20b"
        ),
        messages=[
            {
                "role": "system",
                "content":
                """
                You are Pathwise AI.

                You help users with:

                • CV Reviews
                • Career Advice
                • Scholarships
                • Interviews
                • Programming
                • Job Applications

                Always answer professionally.
                """
            },
            {
                "role": "user",
                "content": message
            }
        ]
    )

    reply = completion.choices[0].message.content

    return Response({
        "reply": reply
    })