"""Add min_value and max_value fields back to Statistic

Revision ID: 0010_add_min_max
Revises: 0009_remove_min_max
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("stats", "0009_remove_min_max"),
    ]

    operations = [
        migrations.AddField(
            model_name="statistic",
            name="min_value",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=10,
                null=True,
                help_text="Minimum allowed value",
            ),
        ),
        migrations.AddField(
            model_name="statistic",
            name="max_value",
            field=models.DecimalField(
                blank=True,
                decimal_places=2,
                max_digits=10,
                null=True,
                help_text="Maximum allowed value",
            ),
        ),
    ]
