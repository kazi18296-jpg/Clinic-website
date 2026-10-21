"""
URL configuration for clinic_backend project.
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('clinic_app.urls')),
    
    # Direct static routes for relative paths: /css/..., /js/..., /assets/...
    re_path(r'^css/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'css')}),
    re_path(r'^js/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'js')}),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'assets')}),
    
    # Serve index.html as homepage
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR)
