from django.urls import path
from . import views

app_name = "dashboard"

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('increment-cv/', views.increment_cv, name='increment_cv'),
]