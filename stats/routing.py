from django.urls import path
from .consumers import DashboardConsumer

websocket_urlpatterns = [
    path('ws/<dashboard_slug>/', DashboardConsumer.as_asgi()),
]
