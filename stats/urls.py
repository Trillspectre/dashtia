from django.urls import path
from .views import (
    StatisticListCreateView,
    DashboardView,
    ChartDataAPIView,
    StatisticCreateView
)

app_name = 'stats'

urlpatterns = [
    path('', StatisticListCreateView.as_view(), name='main'),
    path('create/', StatisticCreateView.as_view(), name='create'),
    path('<slug:slug>/', DashboardView.as_view(), name='dashboard'),
    path('<slug:slug>/chart/', ChartDataAPIView.as_view(), name='chart'),
]