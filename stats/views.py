from django.shortcuts import render
from django.http import HttpResponse
from .models import Statistic, DataItem
# Create your views here.


def main(request):
    qs = Statistic.objects.all()
    return render(request, 'stats/main.html', {'qs': qs})

def dashboard(request, slug):
    return render(request, 'stats/dashboard.html', {})