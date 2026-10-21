import json
from datetime import datetime, date, timedelta
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Sum, Q
from django.core.files.storage import default_storage
from django.contrib import messages

from .models import Doctor, Patient, Appointment, Payment, Prescription, Notice, Review

# Helper to serialize Doctor
def serialize_doctor(doc):
    return {
        'id': doc.doctor_id,
        'pk': doc.pk,
        'name': doc.name,
        'specialty': doc.specialty,
        'fee': float(doc.fee),
        'exp': doc.experience,
        'rating': float(doc.rating),
        'reviewsCount': doc.reviews_count,
        'img': doc.image_url,
        'availableDays': [day.strip() for day in doc.available_days.split(',')],
        'slots': doc.get_slots()
    }

# Helper to serialize Appointment
def serialize_appointment(a):
    return {
        'id': a.appointment_id,
        'doctorId': a.doctor.doctor_id,
        'doctorName': a.doctor.name,
        'doctorSpecialty': a.doctor.specialty,
        'patientName': a.patient_name,
        'patientEmail': a.patient_email,
        'patientPhone': a.patient_phone,
        'patientAge': a.patient_age,
        'patientGender': a.patient_gender,
        'date': str(a.appointment_date),
        'slot': a.slot_time,
        'mode': a.booking_mode,
        'status': a.status,
        'fee': float(a.consultation_fee),
        'symptoms': a.symptoms,
        'paymentStatus': a.payment.status if hasattr(a, 'payment') else 'Pending'
    }

# Helper to serialize Prescription
def serialize_prescription(p):
    data = {
        'id': p.prescription_id,
        'type': p.prescription_type,
        'patientName': p.patient_name,
        'patientEmail': p.patient_email,
        'doctorName': p.doctor_name,
        'doctorSpecialty': p.doctor_specialty,
        'notes': p.notes,
        'createdAt': p.created_at.strftime('%b %d, %Y')
    }
    if p.prescription_type == 'electronic':
        data.update({
            'diagnosis': p.diagnosis,
            'vitals': {
                'bp': p.bp,
                'pulse': p.pulse,
                'spo2': p.spo2
            },
            'medicines': p.get_medicines(),
            'advice': p.advice,
            'date': p.appointment.appointment_date.strftime('%b %d, %Y') if p.appointment else p.created_at.strftime('%b %d, %Y'),
            'qrCodeData': f"MEDPULSE-VERIFIED-{p.prescription_id}"
        })
    else:
        data.update({
            'fileName': p.document_file.name.split('/')[-1] if p.document_file else 'Prescription File',
            'fileUrl': p.document_file.url if p.document_file else '',
            'fileSize': 'Uploaded Doc'
        })
    return data

# ==========================================
# PATIENT-SIDE BACKEND REST APIs
# ==========================================

def api_doctors(request):
    """GET: list of active doctors with slots & details"""
    doctors = Doctor.objects.all()
    return JsonResponse({'status': 'success', 'data': [serialize_doctor(d) for d in doctors]})

def api_notices(request):
    """GET: active notice board announcements"""
    notices = Notice.objects.all().order_by('-created_at')
    data = [{
        'id': f"not-{n.pk}",
        'title': n.title,
        'category': n.category,
        'badge': n.badge,
        'date': n.date_text,
        'summary': n.summary,
        'icon': n.icon
    } for n in notices]
    return JsonResponse({'status': 'success', 'data': data})

@csrf_exempt
def api_reviews(request):
    """GET: all verified reviews; POST: submit a review"""
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            r = Review.objects.create(
                name=body.get('name', 'Anonymous'),
                treatment=body.get('treatment', 'General'),
                rating=float(body.get('rating', 5.0)),
                comment=body.get('comment', ''),
                verified=True
            )
            return JsonResponse({'status': 'success', 'message': 'Review added successfully!'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    reviews = Review.objects.all().order_by('-created_at')
    data = [{
        'id': f"rev-{r.pk}",
        'name': r.name,
        'rating': float(r.rating),
        'treatment': r.treatment,
        'comment': r.comment,
        'verified': r.verified,
        'date': r.created_at.strftime('%b %d, %Y')
    } for r in reviews]
    return JsonResponse({'status': 'success', 'data': data})

@csrf_exempt
def api_register(request):
    """POST: patient registration"""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST only'}, status=405)
    try:
        body = json.loads(request.body)
        email = body.get('email', '').strip().lower()
        if Patient.objects.filter(email=email).exists():
            return JsonResponse({'status': 'error', 'message': 'An account with this email already exists.'}, status=400)
        
        patient = Patient.objects.create(
            name=body.get('name', ''),
            age=int(body.get('age', 25)),
            gender=body.get('gender', 'Male'),
            phone=body.get('phone', ''),
            email=email,
            address=body.get('address', ''),
            password=body.get('password', '')
        )
        return JsonResponse({
            'status': 'success',
            'user': {
                'id': f"pat-{patient.pk}",
                'name': patient.name,
                'email': patient.email,
                'phone': patient.phone,
                'age': patient.age,
                'gender': patient.gender,
                'address': patient.address
            }
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
def api_login(request):
    """POST: patient login"""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST only'}, status=405)
    try:
        body = json.loads(request.body)
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')

        # Quick demo check
        if email == 'patient@medpulse.com':
            patient = Patient.objects.filter(email=email).first()
            if not patient:
                patient = Patient.objects.create(
                    name='Aarav Sharma', age=29, gender='Male', phone='+91 98765 43210',
                    email=email, address='Flat 402, Green Meadows, Bangalore', password='demo'
                )
        else:
            patient = Patient.objects.filter(email=email).first()
            if not patient:
                return JsonResponse({'status': 'error', 'message': 'Account not found. Please register first.'}, status=404)
            if patient.password and patient.password != password:
                return JsonResponse({'status': 'error', 'message': 'Incorrect password.'}, status=400)

        return JsonResponse({
            'status': 'success',
            'user': {
                'id': f"pat-{patient.pk}",
                'name': patient.name,
                'email': patient.email,
                'phone': patient.phone,
                'age': patient.age,
                'gender': patient.gender,
                'address': patient.address
            }
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@csrf_exempt
def api_book_appointment(request):
    """POST: create new appointment with UPI / offline payment & slot validation"""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST only'}, status=405)
    try:
        # Handles multipart form data for screenshot upload or JSON
        data = request.POST if request.POST else json.loads(request.body.decode('utf-8'))
        
        doc_id = data.get('doctorId')
        doctor = Doctor.objects.filter(doctor_id=doc_id).first()
        if not doctor:
            doctor = Doctor.objects.first()

        email = data.get('patientEmail', '').strip().lower()
        patient = Patient.objects.filter(email=email).first()

        appt_date_str = data.get('date')
        try:
            appt_date = datetime.strptime(appt_date_str, '%Y-%m-%d').date()
        except:
            appt_date = date.today()

        slot = data.get('slot', '10:00 AM')
        mode = data.get('mode', 'online')
        appt_code = f"APT-{int(datetime.now().timestamp()) % 1000000:06d}"

        appointment = Appointment.objects.create(
            appointment_id=appt_code,
            doctor=doctor,
            patient=patient,
            patient_name=data.get('patientName', 'Guest Patient'),
            patient_email=email,
            patient_phone=data.get('patientPhone', ''),
            patient_age=int(data.get('patientAge') or 30),
            patient_gender=data.get('patientGender', 'Male'),
            appointment_date=appt_date,
            slot_time=slot,
            booking_mode=mode,
            status='Confirmed',
            symptoms=data.get('symptoms', ''),
            consultation_fee=doctor.fee
        )

        # Payment Record
        screenshot_file = request.FILES.get('screenshot')
        payment = Payment.objects.create(
            appointment=appointment,
            amount=doctor.fee + 30, # with 5% tax
            payment_mode='UPI' if mode == 'online' else 'Desk Cash/Card',
            upi_id=data.get('upiId', ''),
            transaction_ref=data.get('transactionRef', f"REF{appt_code}"),
            screenshot_file=screenshot_file,
            status='Paid' if mode == 'online' else 'Pending'
        )

        return JsonResponse({
            'status': 'success',
            'appointment': serialize_appointment(appointment)
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

def api_patient_appointments(request):
    """GET: list appointments for a patient by email"""
    email = request.GET.get('email', '').strip().lower()
    if email:
        appts = Appointment.objects.filter(patient_email=email)
    else:
        appts = Appointment.objects.all()[:20]
    return JsonResponse({'status': 'success', 'data': [serialize_appointment(a) for a in appts]})

@csrf_exempt
def api_upload_prescription(request):
    """POST: upload previous prescription document"""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST only'}, status=405)
    try:
        file = request.FILES.get('file')
        notes = request.POST.get('notes', 'Previous medical checkup')
        patient_email = request.POST.get('patientEmail', '').strip().lower()
        patient = Patient.objects.filter(email=patient_email).first()
        patient_name = request.POST.get('patientName', patient.name if patient else 'Patient')

        code = f"PREV-{int(datetime.now().timestamp()) % 100000:05d}"
        rx = Prescription.objects.create(
            prescription_id=code,
            prescription_type='uploaded',
            patient=patient,
            patient_name=patient_name,
            patient_email=patient_email,
            document_file=file,
            notes=notes
        )
        return JsonResponse({'status': 'success', 'prescription': serialize_prescription(rx)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

def api_prescriptions(request):
    """GET: list prescriptions for a patient"""
    email = request.GET.get('email', '').strip().lower()
    if email:
        rxs = Prescription.objects.filter(patient_email=email)
    else:
        rxs = Prescription.objects.all()
    return JsonResponse({'status': 'success', 'data': [serialize_prescription(p) for p in rxs]})


# ==========================================
# ADMIN & DOCTOR DASHBOARD VIEWS
# ==========================================

def doctor_login_view(request):
    """Doctor ID + Password Login View"""
    if request.session.get('doctor_id'):
        return redirect('doctor_dashboard')

    if request.method == 'POST':
        doc_id = request.POST.get('doctor_id', '').strip()
        pwd = request.POST.get('password', '').strip()

        doctor = Doctor.objects.filter(doctor_id=doc_id, password=pwd).first()
        if doctor:
            request.session['doctor_id'] = doctor.doctor_id
            request.session['doctor_name'] = doctor.name
            request.session['doctor_specialty'] = doctor.specialty
            messages.success(request, f"Welcome back, {doctor.name}!")
            return redirect('doctor_dashboard')
        else:
            messages.error(request, "Invalid Doctor ID or Password. (Demo: DOC101 / doctorpassword123)")

    return render(request, 'admin_panel/login.html')

def doctor_logout_view(request):
    request.session.flush()
    messages.info(request, "Logged out successfully.")
    return redirect('doctor_login')

def doctor_dashboard_view(request):
    """Doctor Consultation & Clinic Management Dashboard"""
    doc_id = request.session.get('doctor_id')
    if not doc_id:
        # Default to primary doctor for instant review/demo if not explicitly logged out
        default_doc = Doctor.objects.first()
        if default_doc:
            doc_id = default_doc.doctor_id
            request.session['doctor_id'] = default_doc.doctor_id
            request.session['doctor_name'] = default_doc.name
            request.session['doctor_specialty'] = default_doc.specialty
        else:
            return redirect('doctor_login')

    doctor = get_object_or_404(Doctor, doctor_id=doc_id)
    
    # Filter Query Parameters
    status_filter = request.GET.get('status', '')
    mode_filter = request.GET.get('mode', '')
    date_filter = request.GET.get('date', '')
    search_query = request.GET.get('q', '').strip()

    appts = Appointment.objects.filter(doctor=doctor)

    if status_filter:
        appts = appts.filter(status=status_filter)
    if mode_filter:
        appts = appts.filter(booking_mode=mode_filter)
    if date_filter:
        appts = appts.filter(appointment_date=date_filter)
    if search_query:
        appts = appts.filter(
            Q(patient_name__icontains=search_query) |
            Q(appointment_id__icontains=search_query) |
            Q(patient_phone__icontains=search_query)
        )

    # Key Analytics Stats
    total_consultations = Appointment.objects.filter(doctor=doctor).count()
    today_consultations = Appointment.objects.filter(doctor=doctor, appointment_date=date.today()).count()
    completed_consultations = Appointment.objects.filter(doctor=doctor, status='Completed').count()
    pending_consultations = Appointment.objects.filter(doctor=doctor, status='Confirmed').count()
    
    total_revenue = Appointment.objects.filter(
        doctor=doctor, status__in=['Confirmed', 'Completed']
    ).aggregate(Sum('consultation_fee'))['consultation_fee__sum'] or 0

    # Date-wise calculation for Monthly Graph (Last 14 days)
    graph_labels = []
    graph_counts = []
    graph_revenues = []
    
    start_date = date.today() - timedelta(days=13)
    for i in range(14):
        curr_d = start_date + timedelta(days=i)
        d_str = curr_d.strftime('%b %d')
        graph_labels.append(d_str)

        count = Appointment.objects.filter(doctor=doctor, appointment_date=curr_d).count()
        rev = Appointment.objects.filter(doctor=doctor, appointment_date=curr_d).aggregate(Sum('consultation_fee'))['consultation_fee__sum'] or 0
        graph_counts.append(count)
        graph_revenues.append(float(rev))

    context = {
        'doctor': doctor,
        'appointments': appts,
        'total_consultations': total_consultations,
        'today_consultations': today_consultations,
        'completed_consultations': completed_consultations,
        'pending_consultations': pending_consultations,
        'total_revenue': total_revenue,
        'status_filter': status_filter,
        'mode_filter': mode_filter,
        'date_filter': date_filter,
        'search_query': search_query,
        'graph_labels': json.dumps(graph_labels),
        'graph_counts': json.dumps(graph_counts),
        'graph_revenues': json.dumps(graph_revenues),
        'today_date': str(date.today())
    }
    return render(request, 'admin_panel/dashboard.html', context)

def mark_appointment_completed(request, appointment_id):
    """Mark an appointment as completed and optionally generate e-prescription"""
    doc_id = request.session.get('doctor_id')
    if not doc_id:
        return redirect('doctor_login')

    appt = get_object_or_404(Appointment, appointment_id=appointment_id)
    appt.status = 'Completed'
    appt.save()

    # Mark payment as Paid if was pending
    if hasattr(appt, 'payment'):
        appt.payment.status = 'Paid'
        appt.payment.save()

    messages.success(request, f"Appointment {appt.appointment_id} for {appt.patient_name} marked as Completed!")
    return redirect('doctor_dashboard')

@csrf_exempt
def create_doctor_eprescription(request, appointment_id):
    """Doctor writes and signs an E-Prescription for a patient"""
    doc_id = request.session.get('doctor_id')
    if not doc_id:
        return redirect('doctor_login')

    appt = get_object_or_404(Appointment, appointment_id=appointment_id)

    if request.method == 'POST':
        diagnosis = request.POST.get('diagnosis', 'Clinical Consultation')
        bp = request.POST.get('bp', '120/80 mmHg')
        pulse = request.POST.get('pulse', '72 bpm')
        spo2 = request.POST.get('spo2', '99%')
        advice = request.POST.get('advice', '')
        
        # Medicine items
        med_names = request.POST.getlist('med_name[]')
        med_dosages = request.POST.getlist('med_dosage[]')
        med_durations = request.POST.getlist('med_duration[]')

        meds = []
        for i in range(len(med_names)):
            if med_names[i].strip():
                meds.append({
                    'name': med_names[i].strip(),
                    'dosage': med_dosages[i].strip() if i < len(med_dosages) else '',
                    'duration': med_durations[i].strip() if i < len(med_durations) else ''
                })

        rx_code = f"EPX-{int(datetime.now().timestamp()) % 100000:05d}"
        Prescription.objects.create(
            prescription_id=rx_code,
            prescription_type='electronic',
            appointment=appt,
            patient=appt.patient,
            patient_name=appt.patient_name,
            patient_email=appt.patient_email,
            doctor=appt.doctor,
            doctor_name=appt.doctor.name,
            doctor_specialty=appt.doctor.specialty,
            diagnosis=diagnosis,
            bp=bp,
            pulse=pulse,
            spo2=spo2,
            medicines_json=json.dumps(meds),
            advice=advice
        )

        appt.status = 'Completed'
        appt.save()

        messages.success(request, f"E-Prescription {rx_code} created and issued to {appt.patient_name}!")
        return redirect('doctor_dashboard')

    return render(request, 'admin_panel/create_prescription.html', {'appointment': appt})
