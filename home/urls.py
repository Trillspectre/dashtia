from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('sales/', views.sales, name='sales'),
    path('signup/', views.signup, name='signup'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.logout, name='logout')
]