from django.test import TestCase
from decimal import Decimal

# ValidationError no longer used in tests
from django.contrib.auth.models import User

from .models import Statistic, DataItem


class DataItemModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="tester", password="pass"
        )
        self.stat = Statistic.objects.create(
            name="Test KPI",
            owner=self.user,
            unit_type="number",
            # min/max removed
        )

    def test_clean_raises_when_below_min(self):
        di = DataItem(
            statistic=self.stat, value=Decimal("-1.00"), owner="tester"
        )
        # min/max removed; clean() no longer raises for out-of-range values
        di.clean()

    def test_clean_raises_when_above_max(self):
        di = DataItem(
            statistic=self.stat, value=Decimal("150.00"), owner="tester"
        )
        # min/max removed; clean() no longer raises for out-of-range values
        di.clean()

    def test_get_formatted_value(self):
        # percentage
        self.stat.unit_type = "percentage"
        self.stat.save()
        di = DataItem(
            statistic=self.stat, value=Decimal("50.00"), owner="tester"
        )
        self.assertEqual(di.get_formatted_value(), "50.00%")

        # currency
        self.stat.unit_type = "currency"
        self.stat.save()
        di = DataItem(
            statistic=self.stat, value=Decimal("10.50"), owner="tester"
        )
        self.assertEqual(di.get_formatted_value(), "£10.50")

        # custom
        self.stat.unit_type = "custom"
        self.stat.custom_unit = "chats"
        self.stat.save()
        di = DataItem(statistic=self.stat, value=Decimal("3"), owner="tester")
        self.assertEqual(di.get_formatted_value(), "3 chats")


class StatisticViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="creator", password="pass"
        )

    def test_create_statistic_with_units(self):
        self.client.login(username="creator", password="pass")
        resp = self.client.post(
            "/stats/",
            data={
                "new_statistic": "Create KPI",
                "chart_type": "bar",
                "unit_type": "custom",
                "custom_unit": "widgets",
                # min/max removed from form
            },
            follow=True,
        )

        self.assertEqual(resp.status_code, 200)
        stat = Statistic.objects.filter(
            name="Create KPI", owner=self.user
        ).first()
        self.assertIsNotNone(stat)
        self.assertEqual(stat.unit_type, "custom")
        self.assertEqual(stat.custom_unit, "widgets")

    def test_edit_statistic_updates_units(self):
        self.client.login(username="creator", password="pass")
        stat = Statistic.objects.create(name="EditMe", owner=self.user)
        url = f"/stats/{stat.slug}/edit/"
        resp = self.client.post(
            url,
            data={
                "name": "EditMe",
                "chart_type": "line",
                "visibility": "public",
                "unit_type": "percentage",
                "custom_unit": "",
                # min/max removed from form
            },
            follow=True,
        )

        self.assertEqual(resp.status_code, 200)
        stat.refresh_from_db()
        self.assertEqual(stat.unit_type, "percentage")

    def test_delete_statistic_by_owner_soft_deletes_and_logs(self):
        self.client.login(username="creator", password="pass")
        stat = Statistic.objects.create(name="DeleteMe", owner=self.user)
        pk = stat.pk

        resp = self.client.post(f"/stats/{pk}/delete/", follow=True)
        self.assertEqual(resp.status_code, 200)

        # Refresh from DB using all_objects manager
        stat = Statistic.all_objects.get(pk=pk)
        self.assertFalse(stat.is_active)

        # Audit record should exist
        from .models import KpiDeletion

        self.assertTrue(KpiDeletion.objects.filter(statistic=stat).exists())

    def test_delete_statistic_forbidden_for_other_user(self):
        other = User.objects.create_user(username="other", password="pass")
        stat = Statistic.objects.create(name="Safe", owner=self.user)
        self.client.login(username="other", password="pass")

        resp = self.client.post(f"/stats/{stat.pk}/delete/")
        self.assertEqual(resp.status_code, 403)
