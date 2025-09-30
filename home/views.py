from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout as auth_logout, authenticate
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator

def home(request):
    return render(request, 'home/index.html')

def about(request):
    return render(request, 'home/about.html')

@never_cache
@csrf_protect
def signup(request):
    error_message = None
    
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    
    # Add Bootstrap classes to form fields
    for field_name, field in form.fields.items():
        field.widget.attrs.update({'class': 'form-control'})
        if field_name == 'username':
            field.widget.attrs.update({'placeholder': 'Choose a username'})
        elif field_name == 'password1':
            field.widget.attrs.update({'placeholder': 'Enter your password'})
        elif field_name == 'password2':
            field.widget.attrs.update({'placeholder': 'Confirm your password'})
    
    return render(request, 'home/signup.html', {
        'form': form,
        'error_message': error_message
    })

def logout(request):
    auth_logout(request)
    return redirect('home')

@never_cache
@csrf_protect
def user_login(request):
    # If user is already authenticated, redirect to home
    if request.user.is_authenticated:
        return redirect('home')
    
    error_message = None
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('home')
            else:
                error_message = "Invalid username or password. Please try again."
        else:
            # Check if this is a CSRF failure
            if 'csrfmiddlewaretoken' in request.POST:
                error_message = "Your session has expired. Please try logging in again."
            else:
                error_message = "Please correct the errors below."
    else:
        form = AuthenticationForm()
    
    # Add Bootstrap classes to form fields
    form.fields['username'].widget.attrs.update({
        'class': 'form-control',
        'placeholder': 'Enter your username'
    })
    form.fields['password'].widget.attrs.update({
        'class': 'form-control', 
        'placeholder': 'Enter your password'
    })
    
    return render(request, 'home/login.html', {
        'form': form, 
        'error_message': error_message
    })
