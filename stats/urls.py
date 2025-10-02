from django.urls import path
from .views import (
    StatisticListCreateView,
    DashboardView,
    ChartDataAPIView,
    StatisticEditView
)

app_name = 'stats'

urlpatterns = [
    path('', StatisticListCreateView.as_view(), name='main'),
    path('<slug:slug>/edit/', StatisticEditView.as_view(), name='edit'),
    path('<slug:slug>/', DashboardView.as_view(), name='dashboard'),
    path('<slug:slug>/chart/', ChartDataAPIView.as_view(), name='chart'),
]