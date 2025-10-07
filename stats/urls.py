from django.urls import path
from .views import (
    StatisticListCreateView,
    DashboardView,
    ChartDataAPIView,
    StatisticEditView,
    TeamManagementView,
    TeamKPIListAPIView,
    TeamDashboardSelectorView
    ,StatisticDeleteView

)

app_name = 'stats'

urlpatterns = [
    path('', StatisticListCreateView.as_view(), name='main'),
    path('teams/dashboard/', TeamDashboardSelectorView.as_view(), name='team_dashboard_selector'),
    path('admin/teams/', TeamManagementView.as_view(), name='team_management'),
    path('api/team-kpis/', TeamKPIListAPIView.as_view(), name='team_kpis_api'),
    path('<slug:slug>/edit/', StatisticEditView.as_view(), name='edit'),
    path('<int:pk>/delete/', StatisticDeleteView.as_view(), name='delete'),
    path('<slug:slug>/', DashboardView.as_view(), name='dashboard'),
    path('<slug:slug>/chart/', ChartDataAPIView.as_view(), name='chart'),
]