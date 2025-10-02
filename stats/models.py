from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.urls import reverse
# Create your models here.


class Statistic(models.Model):
    CHART_TYPE_CHOICES =[
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
    is_public = models.BooleanField(
        default=True,
        help_text="Whether this KPI is visible to all users"
    )

    def get_absolute_url(self):
        return reverse("stats:dashboard", kwargs={"slug": self.slug})
    
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
    value = models.PositiveSmallIntegerField()
    owner = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.owner}: {self.value}"