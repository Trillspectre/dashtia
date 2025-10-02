from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.generic import ListView, DetailView, CreateView, UpdateView, View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.db.models import Sum, Q, Avg
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from faker import Faker
from .models import Statistic, DataItem

# Create your views here.

fake = Faker()


# KPI permission mixin
class KPIPermissionMixin(LoginRequiredMixin):
    """
    Mixin to handle KPI-specific permissions
    """
    def can_edit_kpi(self, kpi):
        """Check if current user can edit the KPI"""
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return True
        
        return kpi.owner == user
    
    def can_view_kpi(self, kpi):
        """Check if current user can view the KPI"""
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return True
        
        if kpi.is_public:
            return True
            
        return kpi.owner == user


# Standard class based views
class StatisticListCreateView(ListView):
    """
    Display all statistics and create new ones in a single view
    """
    model = Statistic
    template_name = 'stats/main.html'
    context_object_name = 'qs'
    
    def get_queryset(self):

        user = self.request.user

        if user.is_staff or user.is_superuser:
            return Statistic.objects.all()
        else:
            return Statistic.objects.filter(
                Q(is_public=True) | Q(owner=user)
            )
    def post(self, request, *args, **kwargs):
        """Handle POST requests to create new statistics"""
        new_stat = request.POST.get('new-statistic')
        chart_type = request.POST.get('chart-type', 'pie')
        is_public = request.POST.get('is_public', True)
        if new_stat:
            obj, created = Statistic.objects.get_or_create(
                name=new_stat,
                owner=request.user,
                defaults={'chart_type': chart_type}
            )
            if created:
                messages.success(
                    request, 
                    f'KPI "{obj.name}" created successfully!'
                )
            else:
                messages.warning(
                    request,
                    f'KPI "{obj.name}" already exists!'
                )
        # Stay on same page instead of redirecting
        return self.get(request, *args, **kwargs)

class DashboardView(KPIPermissionMixin, DetailView):
    """
    Display dashboard for a specific statistic with permission checking
    """
    model = Statistic
    template_name = 'stats/dashboard.html'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    context_object_name = 'statistic'
    
    def get_object(self, queryset = None):
        obj = super().get_object(queryset)

        if not self.can_view_kpi(obj):
            raise PermissionDenied(
                "You don't have permission to view this"
            )
        return obj

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
            'chart_type': obj.chart_type,
            'data': obj.data.order_by('-id'),  
            'user': user_display,
            'total_entries': obj.data.count(),
            'can_contribute': True,  
            'can_edit': self.can_edit_kpi(obj),
            'can_view': self.can_view_kpi(obj),
            'is_owner': obj.owner == self.request.user,
            'is_admin': self.request.user.is_staff or self.request.user.is_superuser,
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

# Class based Views

class AuthenticatedDashboardView(DashboardView):
    """
    Dashboard view that requires user authentication
    (Already inherits LoginRequiredMixin through KPIPermissionMixin)
    """
    login_url = '/login/'
    redirect_field_name = 'next'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Always use authenticated user's username
        context['user'] = self.request.user.username
        context['is_authenticated'] = True
        return context

class StatisticEditView(KPIPermissionMixin, UpdateView):
    """
    View for editing existing statistics with permission checking
    """
    model = Statistic
    fields = ['name', 'chart_type', 'is_public']
    template_name = 'stats/edit_statistic.html'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'
    
    def get_object(self, queryset = None):
        obj = super().get_object(queryset)

        if not self.can_edit_kpi(obj):
            raise PermissionDenied(
                "You do not have permission to edit this KPI"
                "You can only edit KPIs that you have created"
            )
        
        return obj
    
    def get_form(self, form_class=None):

        form = super().get_form(form_class)

        if not (self.request.user.is_staff or self.request.user.is_superuser):
            if 'is public' in form.fields:
                form.fields['is_public'].widget.attrs['disabled'] = True
                form.fields['is_public'].help_text = "Contact admin to change visibility"

        return form

    def form_valid(self, form):
        messages.success(
            self.request,
            f'Statistic "{form.instance.name}" updated successfully!'
        )
        return super().form_valid(form)
    
    def get_success_url(self):
        return reverse_lazy('stats:main')

class UserStatisticsView(LoginRequiredMixin, ListView):
    """
    Show statistics where user has added data
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

class StatisticContextMixin:
    """
    Mixin to add context
    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        if hasattr(self, 'object') and self.object:
            obj = self.object
            context.update({
                'total_data_points': obj.data.count(),
                'latest_update': obj.data.first(),
                'unique_contributors': obj.data.values_list('owner', flat=True).distinct().count(),
                'average_value': obj.data.aggregate(avg=Avg('value'))['avg'],
            })
        return context
# The Dashboard View
class EnhancedDashboardView(StatisticContextMixin, DashboardView):

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

#The Permissions to edit dashboards
class StatisticPermissionMixin:
    """
    Mixin to handle stats permissions
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
    def dispatch(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)
