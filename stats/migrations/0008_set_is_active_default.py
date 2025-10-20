from django.db import migrations, models


def set_is_active_true(apps, schema_editor):
    Statistic = apps.get_model("stats", "Statistic")
    # Set any existing NULL values to True to satisfy NOT NULL constraint
    Statistic.objects.filter(is_active__isnull=True).update(is_active=True)


class Migration(migrations.Migration):

    dependencies = [
        ("stats", "0007_statistic_is_active_kpideletion"),
    ]

    operations = [
        migrations.RunPython(set_is_active_true, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="statistic",
            name="is_active",
            field=models.BooleanField(
                default=True,
                help_text="Soft-delete flag. Inactive items are hidden from lists.",
            ),
        ),
    ]
