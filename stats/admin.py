from django.contrib import admin
from .models import Statistic, DataItem

# Register your models here.

admin.site.register(Statistic)


class StatisticAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "owner",
        "chart_type",
        "is_public",
        "created_at",
        "data-count",
    ]
    list_filter = ["chart_type", "is_public", "created_at", "owner"]
    search_fields = ["name", "owner__username"]
    readonly_fields = ["slug", "created_at"]

    def data_count(self, obj):
        return obj.data.count()

    data_count.short_description = "Data Points"


admin.site.register(DataItem)
