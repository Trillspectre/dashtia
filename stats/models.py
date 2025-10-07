from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.urls import reverse
from django.core.exceptions import ValidationError
# Create your models here.
class Team(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_teams')
    is_private = models.BooleanField(default=False, help_text="Private teams are only visible to members")

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class TeamMembership(models.Model):
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('admin', 'Team Admin'),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['team', 'user']

class Statistic(models.Model):
    UNIT_TYPE_CHOICES = [
        ('number', 'Number'),
        ('percentage', 'Percentage (%)'),
        ('currency', 'Currency (£)' ),
        ('time', 'Time (minutes)'),
        ('rating', 'Rating (1-10)'),
        ('count', 'Count/Quantity'),
        ('score', 'Score/Points'),
        ('custom', 'Custom Unit'),
        
    ]
    unit_type = models.CharField(
        max_length=20,
        choices=UNIT_TYPE_CHOICES,
        default='number',
        help_text="Type of unit for this KPI"
    )
    custom_unit = models.CharField(
        max_length=50,
        blank=True,
        help_text="Custom unit name (e.g 'chats', 'bugs')"
    )
    min_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Minimum allowed value"
    )
    max_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Maximum allowed value"
    )
    CHART_TYPE_CHOICES = [
        ('pie', 'Pie Chart'),
        ('bar', 'Bar Chart'),
        ('doughnut', 'Doughnut Chart'),
        ('line', 'Line Chart'),
        ('radar', 'Radar Chart'),
        ('polarArea', 'Polar Area Chart'),
    ]
    name = models.CharField(max_length=200)
    slug = models.SlugField(blank=True)
    chart_type = models.CharField(
        max_length=20,
        choices=CHART_TYPE_CHOICES,
        default='pie'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='statistics',
        help_text="User who created this KPI"
    )
    VISIBILITY_CHOICES = [
        ('private', 'Private (Owner Only)'),
        ('team', 'Team Members Only'),
        ('public', 'Public (Everyone)'),
    ]
    visibility = models.CharField(
        max_length=20,
        choices=VISIBILITY_CHOICES,
        default='private'
    )

    teams = models.ManyToManyField(
        Team,
        blank=True,
        related_name='statistics',
        help_text="Teams that can view this KPI (when visibility is set to 'team')"
    )

    def get_absolute_url(self):
        return reverse("stats:dashboard", kwargs={"slug": self.slug})
    def get_unit_display_name(self):
        if self.unit_type == 'custom' and self.custom_unit:
            return self.custom_unit
        return dict(self.UNIT_TYPE_CHOICES).get(self.unit_type, 'Number')
    @property
    def data(self):
        return self.dataitem_set.all()
    
    def __str__(self):
        return str(self.name)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class DataItem(models.Model):
    statistic = models.ForeignKey(Statistic, on_delete=models.CASCADE)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    owner = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    def clean(self):
        if self.statistic.min_value is not None and self.value < self.statistic.min_value:
            raise ValidationError(f'Value must be at least {self.statistic.min_value}')
        if self.statistic.max_value is not None and self.value > self.statistic.max_value:
            raise ValidationError(f'Value must not exceed {self.statistic.max_value}')
        

    def get_formatted_value(self):
        if self.statistic.unit_type == 'percentage':
            return f"{self.value}%"
        elif self.statistic.unit_type == 'currency':
            return f"£{self.value}"
        elif self.statistic.unit_type == 'time':
            return f"{self.value} mins"
        elif self.statistic.unit_type == 'custom':
            return f"{self.value} {self.statistic.custom_unit or ''}".strip()
        return str(self.value)

    def __str__(self):
        return f"{self.owner}: {self.value}"
    

