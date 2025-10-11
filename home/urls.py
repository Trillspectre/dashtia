from django.urls import path
from django.views.generic import RedirectView
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    # New canonical pricing path
    path('pricing/', views.sales, name='pricing'),
    # Keep old /sales/ URL as a redirect to the canonical /pricing/ path
    # (preserves existing links)
    path(
        'sales/',
        RedirectView.as_view(pattern_name='pricing', permanent=True),
    ),
    path('signup/', views.signup, name='signup'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.logout, name='logout')
]
