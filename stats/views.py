from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.generic import ListView, DetailView, CreateView, UpdateView, View, TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.auth.models import User
from django.urls import reverse_lazy
from django.db.models import Sum, Q, Avg
from decimal import Decimal
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from faker import Faker
from .models import Statistic, DataItem, Team, TeamMembership

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
        
        if kpi.owner == user:
            return True
        
        if kpi.visibility == 'public':
            return True
        elif kpi.visibility == 'team':

            user_teams = user.team_membership.values_list('team_id', flat=True)
            kpi_teams = kpi.teams.values_list('id', flat=True)
            return bool(set(user_teams) & set(kpi_teams))
        
        return False
    
    def get_user_accessible_teams(self, user):

        if user.is_staff or user.is_superuser:
            return Team.objects.all()
        
        return Team.objects.filter(
            Q(memberships__user=user) |
            Q(is_private=False)
        ).distinct()
    
    def get_team_kpi_count(self, team, user):
        """Get count of KPIs accessible to user in this team"""
        team_kpis = Statistic.objects.filter(
            Q(teams=team, visibility='team') |
            Q(visibility='public')
        ).distinct()
        
        # Filter by permission
        accessible_count = 0
        for kpi in team_kpis:
            if self.can_view_kpi(kpi):
                accessible_count += 1
        return accessible_count

    def can_view_kpi(self, kpi):
        """Check if current user can view the KPI"""
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return True
        
        if kpi.visibility == 'public':
            return True
        elif kpi.visibility == 'team':
            # Check if user is member of any team that has access
            user_teams = user.team_memberships.values_list('team_id', flat=True)
            kpi_teams = kpi.teams.values_list('id', flat=True)
            return bool(set(user_teams) & set(kpi_teams))
            
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

        if not user.is_authenticated:
            # Anonymous users can only see public statistics
            return Statistic.objects.filter(visibility='public')
        
        if user.is_staff or user.is_superuser:
            return Statistic.objects.all()
        else:
            return Statistic.objects.filter(
                Q(visibility='public') | Q(owner=user)
            )
    def post(self, request, *args, **kwargs):
        """Handle POST requests to create new statistics"""
        new_stat = request.POST.get('new_statistic')
        chart_type = request.POST.get('chart_type', 'pie')
        visibility = request.POST.get('visibility', 'public')
        # Use underscore names to match form inputs
        unit_type = request.POST.get('unit_type', 'number')
        custom_unit = request.POST.get('custom_unit', '')
        min_value = request.POST.get('min_value')
        max_value = request.POST.get('max_value')
        if new_stat:
            obj, created = Statistic.objects.get_or_create(
                name=new_stat,
                owner=request.user,
                defaults={
                    'chart_type': chart_type,
                    'visibility': visibility,
                    'unit_type': unit_type,
                    'custom_unit': custom_unit if unit_type == 'custom' else '',
                    'min_value': Decimal(min_value) if min_value else None,
                    'max_value': Decimal(max_value) if max_value else None,
                }
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

class TeamDashboardSelectorView(KPIPermissionMixin, TemplateView):
    template_name = 'stats/team_dashboard_selector.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user

        dropdown_options = []

        personal_count = Statistic.objects.filter(owner=user).count()
        dropdown_options.append({
            'value': f'personal_{user.id}',
            'label': f'My Personal KPIs ({personal_count})',
            'type': 'personal'
        })

        accessible_teams = self.get_user_accessible_teams(user)
        for team in accessible_teams:
            team_kpi_count = self.get_team_kpi_count(team, user)
            dropdown_options.append({
                'value': f'team_{team.id}',
                'label': f'{team.name} ({team_kpi_count} KPIs)',
                'type': 'team'
            })

        if user.is_staff or user.is_superuser:
            # All users option for admins
            for other_user in User.objects.exclude(id=user.id):
                user_kpi_count = Statistic.objects.filter(owner=other_user).count()
                if user_kpi_count > 0:
                    dropdown_options.append({
                        'value': f'user_{other_user.id}',
                        'label': f"{other_user.username}'s KPIs ({user_kpi_count})",
                        'type': 'user'
                    })
        
        context.update({
            'dropdown_options': dropdown_options,
            'is_admin': user.is_staff or user.is_superuser,
        })
        return context

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
class TeamKPIListAPIView(LoginRequiredMixin, View):

    def get(self,request):
        selection = request.GET.get('selection', '')
        
        if not selection or '_' not in selection:
            return JsonResponse({
                'kpis': [],
                'selection_type': 'none',
                'success': False,
                'error': 'Invalid selection format'
            })
            
        selection_type, selection_id = selection.split('_', 1)

        if selection_type == 'personal':
            kpis = Statistic.objects.filter(owner=request.user)
        elif selection_type == 'team':
            team = get_object_or_404(Team, id=selection_id)

            kpis = Statistic.objects.filter(
                Q(teams=team, visibility='team') |
                Q(visibility='public')
                ).distinct()
        elif selection_type == 'user' and (request.user.is_staff or request.user.is_superuser):
            target_user = get_object_or_404(User, id=selection_id)
            kpis = Statistic.objects.filter(owner=target_user)
        
        accessible_kpis = []
        permissions_mixin = KPIPermissionMixin()
        permissions_mixin.request = request

        for kpi in kpis:
            if permissions_mixin.can_view_kpi(kpi):
                accessible_kpis.append({
                    'id': kpi.id,
                    'name': kpi.name,
                    'slug': kpi.slug,
                    'chart_type': kpi.chart_type,
                    'owner': kpi.owner.username,
                    'data_count': kpi.data.count(),
                })
        return JsonResponse({
            'kpis': accessible_kpis,
            'selection_type': selection_type,
            'success': True
        })
class TeamManagementView(UserPassesTestMixin, ListView):
    model = Team
    template_name = 'stats/admin/team_management.html'
    context_object_name = 'teams'

    def test_func(self):
        return self.request.user.is_staff or self.request.user.is_superuser
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['all_users'] = User.objects.filter(is_active=True)
        return context
    
    def post(self, request, *args, **kwargs):
        action = request.POST.get('action')

        if action == 'create_team':
            team_name = request.POST.get('team_name')
            if not team_name:
                messages.error(request, "Team name is required")
                return redirect('stats:team_management')
                
            team_description = request.POST.get('team_description', '')
            is_private = request.POST.get('is_private') == 'on'
            
            try:
                team = Team.objects.create(
                    name=team_name,
                    description=team_description,
                    is_private=is_private,
                    created_by=request.user
                )
                messages.success(request, f"Team '{team_name}' created successfully")
            except Exception as e:
                messages.error(request, f"Error creating team: {str(e)}")
        
        elif action == 'add_member':
            team_id = request.POST.get('team_id')
            user_id = request.POST.get('user_id')
            role = request.POST.get('role', 'member')

            team = get_object_or_404(Team, id=team_id)
            user = get_object_or_404(User, id=user_id)


            membership, created = TeamMembership.objects.get_or_create(
                team=team,
                user=user,
                defaults={'role': role}
            )

            if created:
                messages.success(request, f'{user.username} added to {team.name}')
            else:
                messages.info(request, f'{user.username} is already in {team.name}')

        return redirect('stats:team_management')
    

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
    fields = ['name', 'chart_type', 'visibility', 'teams', 'unit_type', 'custom_unit', 'min_value', 'max_value']
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
            if 'visibility' in form.fields:
                form.fields['visibility'].widget.attrs['disabled'] = True
                form.fields['visibility'].help_text = "Contact admin to change visibility"

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
