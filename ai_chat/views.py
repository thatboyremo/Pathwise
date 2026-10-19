from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse

from .models import (
    ChatSession,
    ChatMessage,
)

from .services import ChatService


# ==========================================
# Chat Home
# ==========================================

@login_required
def chat_home(request):

    session = (
        ChatSession.objects
        .filter(user=request.user)
        .first()
    )

    if not session:

        session = ChatSession.objects.create(

            user=request.user,

            title="New Chat",

        )

    sessions = (
        ChatSession.objects
        .filter(user=request.user)
        .order_by("-updated_at")
    )

    messages = (
        ChatMessage.objects
        .filter(session=session)
        .order_by("created_at")
    )

    return render(

        request,

        "ai_chat/chat.html",

        {

            "session": session,

            "sessions": sessions,

            "messages": messages,

        },

    )


# ==========================================
# Open Existing Chat
# ==========================================

@login_required
def open_chat(request, pk):

    session = get_object_or_404(

        ChatSession,

        pk=pk,

        user=request.user,

    )

    sessions = (
        ChatSession.objects
        .filter(user=request.user)
        .order_by("-updated_at")
    )

    messages = (
        ChatMessage.objects
        .filter(session=session)
        .order_by("created_at")
    )

    return render(

        request,

        "ai_chat/chat.html",

        {

            "session": session,

            "sessions": sessions,

            "messages": messages,

        },

    )


# ==========================================
# New Chat
# ==========================================

@login_required
def new_chat(request):

    session = ChatSession.objects.create(

        user=request.user,

        title="New Chat",

    )

    return JsonResponse(

        {

            "success": True,

            "session_id": session.id,

        }

    )


# ==========================================
# Send Message
# ==========================================

@login_required
def send_message(request, pk):

    if request.method != "POST":

        return JsonResponse(

            {

                "success": False,

                "error": "POST request required.",

            },

            status=400,

        )

    session = get_object_or_404(

        ChatSession,

        pk=pk,

        user=request.user,

    )

    user_message = request.POST.get(

        "message",

        "",

    ).strip()

    if not user_message:

        return JsonResponse(

            {

                "success": False,

                "error": "Message cannot be empty.",

            },

            status=400,

        )

    try:

        service = ChatService(session)

        assistant = service.send_message(user_message)

        return JsonResponse(

            {

                "success": True,

                "message": assistant.content,

                "session_id": session.id,

                "title": session.title,

            }

        )

    except Exception as e:

        return JsonResponse(

            {

                "success": False,

                "error": str(e),

            }

        )