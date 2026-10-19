from django.urls import path

from . import views


app_name = "ai_chat"


urlpatterns = [

    # =====================================
    # Chat Home
    # =====================================

    path(
        "",
        views.chat_home,
        name="chat_home",
    ),

    # =====================================
    # Open Existing Chat
    # =====================================

    path(
        "chat/<int:pk>/",
        views.open_chat,
        name="open_chat",
    ),

    # =====================================
    # New Chat
    # =====================================

    path(
        "new/",
        views.new_chat,
        name="new_chat",
    ),

    # =====================================
    # Send Message
    # =====================================

    path(
        "chat/<int:pk>/send/",
        views.send_message,
        name="send_message",
    ),

]