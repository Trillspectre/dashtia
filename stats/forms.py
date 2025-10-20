from .views import StatisticListCreateView, DashboardView, ChartDataAPIView


class MainView(StatisticListCreateView):
    pass


class StatsDashboard(DashboardView):
    pass


class ChartAPI(ChartDataAPIView):
    pass
