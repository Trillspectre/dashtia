# Generated manually to remove min_value and max_value from Statistic
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("stats", "0008_set_is_active_default"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="statistic",
            name="min_value",
        ),
        migrations.RemoveField(
            model_name="statistic",
            name="max_value",
        ),
    ]
