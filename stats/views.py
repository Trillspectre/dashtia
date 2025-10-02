from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.generic import ListView, DetailView, CreateView, View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.db.models import Sum
from django.contrib import messages
from faker import Faker
from .models import Statistic, DataItem

# Create your views here.

fake = Faker()
class StatisticListCreateView(ListView):
    """
    Display all statistics and handle creating new ones in a single view
    """
    model = Statistic
    template_name = 'stats/main.html'
    context_object_name = 'qs'
    
    def post(self, request, *args, **kwargs):
        """Handle POST requests to create new statistics"""
        new_stat = request.POST.get('new-statistic')
        if new_stat:
            obj, created = Statistic.objects.get_or_create(name=new_stat)
            if created:
                messages.success(request, f'Statistics "{obj.name}" created successfully!')
            return redirect("stats:dashboard", obj.slug)
        return self.get(request, *args, **kwargs)

class DashboardView(DetailView):
    """
    Display dashboard for a specific statistic
    """
    model = Statistic
    template_name = 'stats/dashboard.html'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    context_object_name = 'statistic'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        obj = self.get_object()
        
        # Determine user display name
        if self.request.user.is_authenticated and self.request.user.username:
            user_display = self.request.user.username
        else:
            user_display = fake.name()
        
        context.update({
            'name': obj.name,
            'slug': obj.slug,
            'data': obj.data.order_by('-id'),  # Show latest first
            'user': user_display,
            'total_entries': obj.data.count(),
            'can_contribute': True,  # You can add permission logic here later
        })
        return context

class ChartDataAPIView(View):
    """
    API endpoint for chart data - returns JSON for Chart.js
    """
    def get(self, request, slug):
        obj = get_object_or_404(Statistic, slug=slug)
        
        # Group values by owner and sum them
        qs = obj.data.values('owner').annotate(total=Sum('value')).order_by('-total')
        
        chart_data = [item['total'] for item in qs]
        chart_labels = [item['owner'] for item in qs]
        
        return JsonResponse({
            'chartData': chart_data,
            'chartLabels': chart_labels,
            'success': True
        })

# ===============================
# ADVANCED CLASS-BASED VIEWS
# ===============================

class AuthenticatedDashboardView(LoginRequiredMixin, DashboardView):
    """
    Dashboard view that requires user authentication
    """
    login_url = '/login/'
    redirect_field_name = 'next'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Always use authenticated user's username
        context['user'] = self.request.user.username
        context['is_authenticated'] = True
        return context

class StatisticCreateView(CreateView):
    """
    Dedicated view for creating new statistics with form validation
    """
    model = Statistic
    fields = ['name']
    template_name = 'stats/create_statistic.html'
    success_url = reverse_lazy('stats:main')
    
    def form_valid(self, form):
        messages.success(self.request, f'Statistic "{form.instance.name}" created successfully!')
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('stats:dashboard', kwargs={'slug': self.object.slug})

class UserStatisticsView(LoginRequiredMixin, ListView):
    """
    Show statistics where user has contributed data
    """
    model = Statistic
    template_name = 'stats/user_stats.html'
    context_object_name = 'user_statistics'
    
    def get_queryset(self):
        # Get statistics where current user has submitted data
        user_stats_ids = DataItem.objects.filter(
            owner=self.request.user.username
        ).values_list('statistic_id', flat=True).distinct()
        
        return Statistic.objects.filter(id__in=user_stats_ids)

class StatisticDetailAPIView(View):
    """
    API endpoint for detailed statistic information
    """
    def get(self, request, slug):
        obj = get_object_or_404(Statistic, slug=slug)
        
        # Calculate statistics
        data_items = obj.data.all()
        total_value = data_items.aggregate(Sum('value'))['value__sum'] or 0
        contributors = data_items.values_list('owner', flat=True).distinct()
        
        return JsonResponse({
            'name': obj.name,
            'slug': obj.slug,
            'total_entries': data_items.count(),
            'total_value': total_value,
            'contributors': list(contributors),
            'latest_entries': [
                {
                    'owner': item.owner,
                    'value': item.value,
                    'id': item.id
                } for item in data_items[:5]
            ]
        })

# ===============================
# MIXINS FOR REUSABLE FUNCTIONALITY
# ===============================

class StatisticContextMixin:
    """
    Mixin to add common statistic-related context
    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        if hasattr(self, 'object') and self.object:
            obj = self.object
            context.update({
                'total_data_points': obj.data.count(),
                'latest_update': obj.data.first(),
                'unique_contributors': obj.data.values_list('owner', flat=True).distinct().count(),
                'average_value': obj.data.aggregate(avg=models.Avg('value'))['avg'],
            })
        return context

class EnhancedDashboardView(StatisticContextMixin, DashboardView):
    """
    Dashboard with enhanced statistics and context
    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        obj = self.get_object()
        
        # Add trend analysis
        recent_data = obj.data.order_by('-id')[:10]
        context.update({
            'recent_trends': recent_data,
            'top_contributors': obj.data.values('owner').annotate(
                total=Sum('value')
            ).order_by('-total')[:5]
        })
        return context

# ===============================
# PERMISSION-BASED VIEWS
# ===============================

class StatisticPermissionMixin:
    """
    Mixin to handle statistic-specific permissions
    """
    def can_user_contribute(self, statistic):
        """Override this method to implement custom permission logic"""
        return True  # Default: everyone can contribute
    
    def dispatch(self, request, *args, **kwargs):
        # Add permission checking logic here if needed
        return super().dispatch(request, *args, **kwargs)

class ProtectedDashboardView(StatisticPermissionMixin, DashboardView):
    """
    Dashboard with permission checking
    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        obj = self.get_object()
        context['can_contribute'] = self.can_user_contribute(obj)
        return context
# Old function-based views removed - now using class-based views above