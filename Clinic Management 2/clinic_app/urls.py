from django.urls import path
from . import views

urlpatterns = [
    # REST APIs for Patient-side frontend
    path('api/doctors/', views.api_doctors, name='api_doctors'),
    path('api/notices/', views.api_notices, name='api_notices'),
    path('api/reviews/', views.api_reviews, name='api_reviews'),
    path('api/auth/register/', views.api_register, name='api_register'),
    path('api/auth/login/', views.api_login, name='api_login'),
    path('api/appointments/book/', views.api_book_appointment, name='api_book_appointment'),
    path('api/appointments/', views.api_patient_appointments, name='api_patient_appointments'),
    path('api/prescriptions/upload/', views.api_upload_prescription, name='api_upload_prescription'),
    path('api/prescriptions/', views.api_prescriptions, name='api_prescriptions'),

    # Doctor Portal & Admin Panel
    path('doctor/login/', views.doctor_login_view, name='doctor_login'),
    path('doctor/logout/', views.doctor_logout_view, name='doctor_logout'),
    path('doctor/dashboard/', views.doctor_dashboard_view, name='doctor_dashboard'),
    path('doctor/appointment/<str:appointment_id>/complete/', views.mark_appointment_completed, name='mark_appointment_completed'),
    path('doctor/appointment/<str:appointment_id>/prescribe/', views.create_doctor_eprescription, name='create_doctor_eprescription'),
]

