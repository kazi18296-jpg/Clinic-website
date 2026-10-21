from django.db import models
import json

class Doctor(models.Model):
    doctor_id = models.CharField(max_length=50, unique=True) # e.g. DOC101
    password = models.CharField(max_length=128) # For doctor portal login
    name = models.CharField(max_length=150)
    specialty = models.CharField(max_length=150)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    experience = models.CharField(max_length=50, default='10+ Yrs')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.9)
    reviews_count = models.IntegerField(default=100)
    image_url = models.TextField(blank=True, default='')
    available_days = models.CharField(max_length=200, default='Mon, Tue, Wed, Thu, Fri')
    slots_json = models.TextField(default='["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM", "05:30 PM"]')
    created_at = models.DateTimeField(auto_now_add=True)

    def get_slots(self):
        try:
            return json.loads(self.slots_json)
        except:
            return ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM", "05:30 PM"]

    def __str__(self):
        return f"{self.name} ({self.specialty})"

class Patient(models.Model):
    name = models.CharField(max_length=150)
    age = models.IntegerField()
    gender = models.CharField(max_length=20, default='Male')
    phone = models.CharField(max_length=25)
    email = models.EmailField(unique=True)
    address = models.TextField()
    password = models.CharField(max_length=128, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.email}"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled')
    )
    MODE_CHOICES = (
        ('online', 'Online Slot'),
        ('offline', 'Offline Clinic Walk-In')
    )
    appointment_id = models.CharField(max_length=50, unique=True) # e.g. APT-892182
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    patient_name = models.CharField(max_length=150)
    patient_email = models.EmailField()
    patient_phone = models.CharField(max_length=25)
    patient_age = models.IntegerField(default=30)
    patient_gender = models.CharField(max_length=20, default='Male')
    appointment_date = models.DateField()
    slot_time = models.CharField(max_length=30) # e.g. "10:00 AM"
    booking_mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='online')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Confirmed')
    symptoms = models.TextField(blank=True, default='')
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-appointment_date', '-created_at']

    def __str__(self):
        return f"{self.appointment_id} - {self.patient_name} with {self.doctor.name}"

class Payment(models.Model):
    STATUS_CHOICES = (
        ('Paid', 'Paid (Verified)'),
        ('Pending', 'Pending Desk Payment'),
        ('Failed', 'Failed')
    )
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_mode = models.CharField(max_length=50, default='UPI') # 'UPI' or 'Desk Cash/Card'
    upi_id = models.CharField(max_length=100, blank=True, default='')
    transaction_ref = models.CharField(max_length=100, blank=True, default='')
    screenshot_file = models.FileField(upload_to='payments/', blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Paid')
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for {self.appointment.appointment_id}: ₹{self.amount} ({self.status})"

class Prescription(models.Model):
    TYPE_CHOICES = (
        ('electronic', 'Doctor E-Prescription'),
        ('uploaded', 'Patient Previous Upload')
    )
    prescription_id = models.CharField(max_length=50, unique=True) # e.g. EPX-10293 or PREV-9921
    prescription_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='electronic')
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions')
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions')
    patient_name = models.CharField(max_length=150)
    patient_email = models.EmailField()
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions')
    doctor_name = models.CharField(max_length=150, blank=True, default='')
    doctor_specialty = models.CharField(max_length=150, blank=True, default='')
    
    # E-Prescription Clinical Details
    diagnosis = models.TextField(blank=True, default='')
    bp = models.CharField(max_length=50, default='120/80 mmHg')
    pulse = models.CharField(max_length=50, default='72 bpm')
    spo2 = models.CharField(max_length=50, default='99%')
    medicines_json = models.TextField(default='[]') # list of {name, dosage, duration}
    advice = models.TextField(blank=True, default='')
    
    # Uploaded prescription file
    document_file = models.FileField(upload_to='prescriptions/', blank=True, null=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def get_medicines(self):
        try:
            return json.loads(self.medicines_json)
        except:
            return []

    def __str__(self):
        return f"{self.prescription_id} ({self.prescription_type}) - {self.patient_name}"

class Notice(models.Model):
    title = models.CharField(max_length=250)
    category = models.CharField(max_length=100, default='Health Camp')
    badge = models.CharField(max_length=50, default='Important')
    date_text = models.CharField(max_length=50, default='Oct 18, 2026')
    summary = models.TextField()
    icon = models.CharField(max_length=50, default='fa-heartbeat')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Review(models.Model):
    name = models.CharField(max_length=150)
    treatment = models.CharField(max_length=150)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=5.0)
    comment = models.TextField()
    verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.rating}★"
