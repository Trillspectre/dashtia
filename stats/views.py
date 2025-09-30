from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from .models import Statistic, DataItem
from django.db.models import Sum
# from faker import Faker  # Temporarily commented out - module not installed

# Create your views here.

# fake = Faker()  # Temporarily commented out
def main(request):
    qs = Statistic.objects.all()
    if request.method == 'POST':
        new_stat = request.POST.get('new-statistic')
        obj, _ = Statistic.objects.get_or_create(name=new_stat)
        return redirect("stats:dashboard", obj.slug)
    return render(request, 'stats/main.html', {'qs': qs})


def dashboard(request, slug):
    obj = get_object_or_404(Statistic, slug=slug)
    return render(request, 'stats/dashboard.html', {
        'name': obj.name,
        'slug': obj.slug,
        'data': obj.data,
        'user': request.user.username if request.user.username else 'Anonymous User'
    })


def chart_data(request, slug):
    obj = get_object_or_404(Statistic, slug=slug)
    # groups values by owner
    qs = obj.data.values('owner').annotate(Sum('value'))
    chart_data = [x['value__sum'] for x in qs]
    chart_labels = [x['owner'] for x in qs]
    return JsonResponse({
        'chartData': chart_data,
        'chartLabels': chart_labels
    })