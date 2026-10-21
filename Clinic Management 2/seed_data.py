import os
import django
import json
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')
django.setup()

from clinic_app.models import Doctor, Patient, Appointment, Payment, Prescription, Notice, Review
from django.contrib.auth.models import User

def seed_all():
    print("Seeding Doctors...")
    docs_data = [
        {
            "doctor_id": "DOC101",
            "password": "doctorpassword123",
            "name": "Dr. Sarah Jenkins, MD",
            "specialty": "Chief Cardiologist & Internal Medicine",
            "fee": 600.00,
            "experience": "14+ Yrs Exp",
            "rating": 4.9,
            "reviews_count": 142,
            "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
            "available_days": "Mon, Tue, Wed, Thu, Fri",
            "slots_json": json.dumps(["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM", "05:30 PM"])
        },
        {
            "doctor_id": "DOC102",
            "password": "doctorpassword123",
            "name": "Dr. Arvind Sharma, MBBS, MS",
            "specialty": "Senior Orthopedic & Joint Surgeon",
            "fee": 550.00,
            "experience": "12+ Yrs Exp",
            "rating": 4.8,
            "reviews_count": 118,
            "image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
            "available_days": "Mon, Wed, Fri, Sat",
            "slots_json": json.dumps(["09:30 AM", "11:00 AM", "01:00 PM", "03:30 PM", "05:00 PM"])
        },
        {
            "doctor_id": "DOC103",
            "password": "doctorpassword123",
            "name": "Dr. Elena Rostova, MD",
            "specialty": "Pediatric Specialist & Child Health",
            "fee": 500.00,
            "experience": "9+ Yrs Exp",
            "rating": 5.0,
            "reviews_count": 205,
            "image_url": "https://images.unsplash.com/photo-1594824813570-5807954b9d79?auto=format&fit=crop&w=400&q=80",
            "available_days": "Tue, Thu, Fri, Sat, Sun",
            "slots_json": json.dumps(["10:00 AM", "11:30 AM", "02:30 PM", "04:00 PM", "06:00 PM"])
        },
        {
            "doctor_id": "DOC104",
            "password": "doctorpassword123",
            "name": "Dr. Marcus Vance, MD, DM",
            "specialty": "Neurologist & Brain Wellness",
            "fee": 750.00,
            "experience": "16+ Yrs Exp",
            "rating": 4.9,
            "reviews_count": 97,
            "image_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
            "available_days": "Mon, Tue, Wed, Thu, Sat",
            "slots_json": json.dumps(["10:00 AM", "12:00 PM", "03:00 PM", "04:30 PM", "06:00 PM"])
        }
    ]

    for d in docs_data:
        Doctor.objects.update_or_create(doctor_id=d["doctor_id"], defaults=d)

    print("Seeding Notices...")
    notices_data = [
        {
            "title": "Free Preventive Diabetes & Cardiac Camp This Sunday",
            "category": "Health Camp",
            "badge": "Important",
            "date_text": "Oct 18, 2026",
            "summary": "Complimentary blood sugar, HbA1c, ECG and cardiologist consultations available from 8 AM to 2 PM at Main Wing B.",
            "icon": "fa-heartbeat"
        },
        {
            "title": "Flu & Pneumococcal Vaccination Drive Active",
            "category": "Vaccination",
            "badge": "Seasonal",
            "date_text": "Oct 14, 2026",
            "summary": "Protect your family ahead of winter changes. Priority booking open for seniors and children below 12 years.",
            "icon": "fa-syringe"
        },
        {
            "title": "24/7 Digital Prescription Access & Online Consultation Tele-Hub",
            "category": "Clinic Update",
            "badge": "New Feature",
            "date_text": "Oct 10, 2026",
            "summary": "All patients can now download digital QR-stamped e-prescriptions directly from their patient portal within 10 minutes of consultation.",
            "icon": "fa-file-prescription"
        },
        {
            "title": "Diwali & Festive Weekend Clinic Timings Announced",
            "category": "Timing Update",
            "badge": "Schedule",
            "date_text": "Oct 05, 2026",
            "summary": "Emergency trauma & triage remains functional 24/7. OPD hours will run from 9:00 AM to 1:00 PM during upcoming festival days.",
            "icon": "fa-clock"
        }
    ]
    for n in notices_data:
        Notice.objects.update_or_create(title=n["title"], defaults=n)

    print("Seeding Reviews...")
    reviews_data = [
        {
            "name": "Ananya Deshmukh",
            "treatment": "Cardiology Checkup",
            "rating": 5.0,
            "comment": "Dr. Sarah was so calm and thorough. The online booking and UPI verification was instantaneous, and walking in without waiting in endless queues felt incredible!",
            "verified": True
        },
        {
            "name": "Rahul K. Verma",
            "treatment": "Orthopedic Joint Care",
            "rating": 5.0,
            "comment": "I uploaded my previous MRI and prescription directly onto the portal. Dr. Arvind had reviewed it before I even stepped into the consulting room. World-class setup!",
            "verified": True
        },
        {
            "name": "Meera Nambiar",
            "treatment": "Pediatric Care",
            "rating": 5.0,
            "comment": "Best pediatric environment for kids. The animated clinic ambiance calmed my daughter down, and the digital e-prescription QR code made pharmacy pickup instantaneous.",
            "verified": True
        },
        {
            "name": "Col. Rajesh Sen (Retd.)",
            "treatment": "Neurology Consultation",
            "rating": 4.8,
            "comment": "Seamless appointment management. The clinic staff is polite, payment QR system works flawlessly, and the e-prescription copy with dosage schedule is crystal clear.",
            "verified": True
        }
    ]
    for r in reviews_data:
        Review.objects.update_or_create(name=r["name"], comment=r["comment"], defaults=r)

    print("Seeding Demo Patients & Appointments across dates...")
    patient, _ = Patient.objects.update_or_create(
        email="patient@medpulse.com",
        defaults={
            "name": "Aarav Sharma",
            "age": 29,
            "gender": "Male",
            "phone": "+91 98765 43210",
            "address": "Flat 402, Green Meadows, MG Road, Bangalore",
            "password": "demo123"
        }
    )

    doc1 = Doctor.objects.get(doctor_id="DOC101")
    doc2 = Doctor.objects.get(doctor_id="DOC102")
    doc3 = Doctor.objects.get(doctor_id="DOC103")

    # Create past, today and upcoming appointments for rich graphs & lists
    today = date.today()
    sample_appts = [
        {
            "appointment_id": "APT-882190",
            "doctor": doc1,
            "patient": patient,
            "patient_name": patient.name,
            "patient_email": patient.email,
            "patient_phone": patient.phone,
            "patient_age": 29,
            "patient_gender": "Male",
            "appointment_date": today,
            "slot_time": "10:00 AM",
            "booking_mode": "online",
            "status": "Confirmed",
            "symptoms": "Occasional palpitations after heavy exercise",
            "consultation_fee": 600.00
        },
        {
            "appointment_id": "APT-716290",
            "doctor": doc1,
            "patient": None,
            "patient_name": "Priya Nair",
            "patient_email": "priya.nair@example.com",
            "patient_phone": "+91 98111 22334",
            "patient_age": 42,
            "patient_gender": "Female",
            "appointment_date": today,
            "slot_time": "11:30 AM",
            "booking_mode": "online",
            "status": "Confirmed",
            "symptoms": "Hypertension routine checkup and ECG analysis",
            "consultation_fee": 600.00
        },
        {
            "appointment_id": "APT-652194",
            "doctor": doc1,
            "patient": None,
            "patient_name": "Kunal Kapoor",
            "patient_email": "kunal.k@example.com",
            "patient_phone": "+91 97222 33445",
            "patient_age": 35,
            "patient_gender": "Male",
            "appointment_date": today - timedelta(days=1),
            "slot_time": "02:00 PM",
            "booking_mode": "offline",
            "status": "Completed",
            "symptoms": "General annual executive checkup",
            "consultation_fee": 600.00
        },
        {
            "appointment_id": "APT-542188",
            "doctor": doc2,
            "patient": None,
            "patient_name": "Siddharth Jain",
            "patient_email": "sid.jain@example.com",
            "patient_phone": "+91 99000 44556",
            "patient_age": 51,
            "patient_gender": "Male",
            "appointment_date": today - timedelta(days=2),
            "slot_time": "09:30 AM",
            "booking_mode": "online",
            "status": "Completed",
            "symptoms": "Right knee joint stiffness and runner knee pain",
            "consultation_fee": 550.00
        },
        {
            "appointment_id": "APT-432199",
            "doctor": doc1,
            "patient": None,
            "patient_name": "Kavita Rao",
            "patient_email": "kavita.r@example.com",
            "patient_phone": "+91 99555 66778",
            "patient_age": 60,
            "patient_gender": "Female",
            "appointment_date": today - timedelta(days=3),
            "slot_time": "04:00 PM",
            "booking_mode": "online",
            "status": "Completed",
            "symptoms": "Post-cardiac stent follow-up review",
            "consultation_fee": 600.00
        },
        {
            "appointment_id": "APT-329184",
            "doctor": doc3,
            "patient": None,
            "patient_name": "Baby Rohan Gupta",
            "patient_email": "neha.gupta@example.com",
            "patient_phone": "+91 98888 11223",
            "patient_age": 4,
            "patient_gender": "Male",
            "appointment_date": today - timedelta(days=4),
            "slot_time": "10:00 AM",
            "booking_mode": "online",
            "status": "Completed",
            "symptoms": "Persistent dry cough and mild fever",
            "consultation_fee": 500.00
        },
        {
            "appointment_id": "APT-219842",
            "doctor": doc1,
            "patient": None,
            "patient_name": "Sunil Varma",
            "patient_email": "sunil.varma@example.com",
            "patient_phone": "+91 97777 88990",
            "patient_age": 48,
            "patient_gender": "Male",
            "appointment_date": today + timedelta(days=1),
            "slot_time": "09:00 AM",
            "booking_mode": "online",
            "status": "Confirmed",
            "symptoms": "Chest tightness and high cholesterol reports",
            "consultation_fee": 600.00
        }
    ]

    for item in sample_appts:
        appt, _ = Appointment.objects.update_or_create(
            appointment_id=item["appointment_id"],
            defaults=item
        )
        # Payment record
        Payment.objects.update_or_create(
            appointment=appt,
            defaults={
                "amount": appt.consultation_fee + 30, # with taxes
                "payment_mode": "UPI" if appt.booking_mode == 'online' else "Desk Cash/Card",
                "upi_id": "patient@oksbi" if appt.booking_mode == 'online' else "",
                "transaction_ref": f"UTR{appt.appointment_id.split('-')[1]}9281",
                "status": "Paid" if appt.booking_mode == 'online' or appt.status == 'Completed' else "Pending"
            }
        )

    # Seed Sample Electronic Prescription
    first_appt = Appointment.objects.get(appointment_id="APT-882190")
    Prescription.objects.update_or_create(
        prescription_id="EPX-88219",
        defaults={
            "prescription_type": "electronic",
            "appointment": first_appt,
            "patient": patient,
            "patient_name": patient.name,
            "patient_email": patient.email,
            "doctor": doc1,
            "doctor_name": doc1.name,
            "doctor_specialty": doc1.specialty,
            "diagnosis": "Cardiovascular Stress Evaluation & Normal Vitals Check",
            "bp": "118/78 mmHg",
            "pulse": "72 bpm",
            "spo2": "99%",
            "medicines_json": json.dumps([
                {"name": "Tab. Telmisartan 40mg", "dosage": "1 tablet once daily morning (after food)", "duration": "30 Days"},
                {"name": "Cap. Omega-3 Fish Oil 1000mg", "dosage": "1 capsule post lunch", "duration": "30 Days"},
                {"name": "Tab. Vitamin D3 60,000 IU", "dosage": "1 tablet weekly once with milk", "duration": "4 Weeks"}
            ]),
            "advice": "Maintain brisk 30 min walking routine. Low sodium diet (< 4g/day). Repeat lipid profile after 60 days.",
            "notes": "Follow-up in 2 months."
        }
    )

    # Superuser admin
    if not User.objects.filter(username="admin").exists():
        User.objects.create_superuser("admin", "admin@medpulse.com", "admin123")
        print("Created superuser: admin / admin123")

    print("Data seeding completed successfully!")

if __name__ == "__main__":
    seed_all()

