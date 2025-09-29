from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .models import Statistic, DataItem
from faker import Faker

# Create your views here.

fake = Faker()
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
        'user': request.user.username if request.user.username else fake.name()
    })