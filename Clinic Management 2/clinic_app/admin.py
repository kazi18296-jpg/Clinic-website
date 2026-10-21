from django.contrib import admin
from .models import Doctor, Patient, Appointment, Payment, Prescription, Notice, Review

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('doctor_id', 'name', 'specialty', 'fee', 'rating')
    search_fields = ('doctor_id', 'name', 'specialty')

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'age', 'gender', 'created_at')
    search_fields = ('name', 'email', 'phone')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('appointment_id', 'patient_name', 'doctor', 'appointment_date', 'slot_time', 'booking_mode', 'status')
    list_filter = ('status', 'booking_mode', 'appointment_date')
    search_fields = ('appointment_id', 'patient_name', 'patient_email')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('appointment', 'amount', 'payment_mode', 'status', 'paid_at')
    list_filter = ('status', 'payment_mode')

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('prescription_id', 'prescription_type', 'patient_name', 'doctor_name', 'created_at')
    list_filter = ('prescription_type',)
    search_fields = ('prescription_id', 'patient_name', 'patient_email')

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'date_text')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'treatment', 'rating', 'verified', 'created_at')
