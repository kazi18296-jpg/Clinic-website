/**
 * MedPulse Advanced Clinic Management System
 * Core State & LocalStorage Management (Mock DB / Dummy APIs)
 */

const STORAGE_KEYS = {
    USER: 'medpulse_current_user',
    PATIENTS: 'medpulse_patients',
    APPOINTMENTS: 'medpulse_appointments',
    PRESCRIPTIONS: 'medpulse_prescriptions',
    REVIEWS: 'medpulse_reviews',
    NOTICES: 'medpulse_notices',
    DOCTORS: 'medpulse_doctors'
};

// Initial Seed Data
const DEFAULT_DOCTORS = [
    {
        id: 'doc-1',
        name: 'Dr. Sarah Jenkins, MD',
        specialty: 'Chief Cardiologist & Internal Medicine',
        rating: 4.9,
        reviewsCount: 142,
        exp: '14+ Yrs Exp',
        fee: 600,
        img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        slots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM', '05:30 PM']
    },
    {
        id: 'doc-2',
        name: 'Dr. Arvind Sharma, MBBS, MS',
        specialty: 'Senior Orthopedic & Joint Surgeon',
        rating: 4.8,
        reviewsCount: 118,
        exp: '12+ Yrs Exp',
        fee: 550,
        img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
        slots: ['09:30 AM', '11:00 AM', '01:00 PM', '03:30 PM', '05:00 PM']
    },
    {
        id: 'doc-3',
        name: 'Dr. Elena Rostova, MD',
        specialty: 'Pediatric Specialist & Child Health',
        rating: 5.0,
        reviewsCount: 205,
        exp: '9+ Yrs Exp',
        fee: 500,
        img: 'https://images.unsplash.com/photo-1594824813570-5807954b9d79?auto=format&fit=crop&w=400&q=80',
        availableDays: ['Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
        slots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM', '06:00 PM']
    },
    {
        id: 'doc-4',
        name: 'Dr. Marcus Vance, MD, DM',
        specialty: 'Neurologist & Brain Wellness',
        rating: 4.9,
        reviewsCount: 97,
        exp: '16+ Yrs Exp',
        fee: 750,
        img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Sat'],
        slots: ['10:00 AM', '12:00 PM', '03:00 PM', '04:30 PM', '06:00 PM']
    }
];

const DEFAULT_NOTICES = [
    {
        id: 'not-1',
        title: 'Free Preventive Diabetes & Cardiac Camp This Sunday',
        category: 'Health Camp',
        badge: 'Important',
        date: 'Oct 18, 2026',
        summary: 'Complimentary blood sugar, HbA1c, ECG and cardiologist consultations available from 8 AM to 2 PM at Main Wing B.',
        icon: 'fa-heartbeat'
    },
    {
        id: 'not-2',
        title: 'Flu & Pneumococcal Vaccination Drive Active',
        category: 'Vaccination',
        badge: 'Seasonal',
        date: 'Oct 14, 2026',
        summary: 'Protect your family ahead of winter changes. Priority booking open for seniors and children below 12 years.',
        icon: 'fa-syringe'
    },
    {
        id: 'not-3',
        title: '24/7 Digital Prescription Access & Online Consultation Tele-Hub',
        category: 'Clinic Update',
        badge: 'New Feature',
        date: 'Oct 10, 2026',
        summary: 'All patients can now download digital QR-stamped e-prescriptions directly from their patient portal within 10 minutes of consultation.',
        icon: 'fa-file-prescription'
    },
    {
        id: 'not-4',
        title: 'Diwali & Festive Weekend Clinic Timings Announced',
        category: 'Timing Update',
        badge: 'Schedule',
        date: 'Oct 05, 2026',
        summary: 'Emergency trauma & triage remains functional 24/7. OPD hours will run from 9:00 AM to 1:00 PM during upcoming festival days.',
        icon: 'fa-clock'
    }
];

const DEFAULT_REVIEWS = [
    {
        id: 'rev-1',
        name: 'Ananya Deshmukh',
        age: 32,
        rating: 5,
        treatment: 'Cardiology Checkup',
        date: '3 days ago',
        comment: 'Dr. Sarah was so calm and thorough. The online booking and UPI verification was instantaneous, and walking in without waiting in endless queues felt incredible!',
        verified: true
    },
    {
        id: 'rev-2',
        name: 'Rahul K. Verma',
        age: 46,
        rating: 5,
        treatment: 'Orthopedic Joint Care',
        date: '1 week ago',
        comment: 'I uploaded my previous MRI and prescription directly onto the portal. Dr. Arvind had reviewed it before I even stepped into the consulting room. World-class setup!',
        verified: true
    },
    {
        id: 'rev-3',
        name: 'Meera Nambiar',
        age: 28,
        rating: 5,
        treatment: 'Pediatric Care',
        date: '2 weeks ago',
        comment: 'Best pediatric environment for kids. The animated clinic ambiance calmed my daughter down, and the digital e-prescription QR code made pharmacy pickup instantaneous.',
        verified: true
    },
    {
        id: 'rev-4',
        name: 'Col. Rajesh Sen (Retd.)',
        age: 63,
        rating: 4.8,
        treatment: 'Neurology Consultation',
        date: '3 weeks ago',
        comment: 'Seamless appointment management. The clinic staff is polite, payment QR system works flawlessly, and the e-prescription copy with dosage schedule is crystal clear.',
        verified: true
    }
];

class ClinicStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
            localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(DEFAULT_DOCTORS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
            localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(DEFAULT_NOTICES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
            localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(DEFAULT_REVIEWS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
            // Seed a sample appointment if user logs into demo
            localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) {
            localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify([]));
        }
    }

    getDoctors() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS) || '[]');
    }

    getNotices() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTICES) || '[]');
    }

    getReviews() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    }

    addReview(review) {
        const reviews = this.getReviews();
        review.id = 'rev-' + Date.now();
        review.date = 'Just now';
        review.verified = true;
        reviews.unshift(review);
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
        return review;
    }

    // Patient Auth
    getCurrentUser() {
        const u = localStorage.getItem(STORAGE_KEYS.USER);
        return u ? JSON.parse(u) : null;
    }

    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
    }

    getPatients() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    }

    registerPatient(patientData) {
        const patients = this.getPatients();
        const existing = patients.find(p => p.email.toLowerCase() === patientData.email.toLowerCase());
        if (existing) {
            throw new Error('An account with this email already exists.');
        }
        const newPatient = {
            id: 'pat-' + Date.now(),
            ...patientData,
            createdAt: new Date().toISOString()
        };
        patients.push(newPatient);
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
        this.setCurrentUser(newPatient);

        // Also add a sample welcome e-prescription for rich experience
        this.addSamplePrescription(newPatient);

        return newPatient;
    }

    loginPatient(email, password) {
        const patients = this.getPatients();
        const user = patients.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            // Allow quick demo login if entered demo credentials
            if (email.toLowerCase() === 'patient@medpulse.com') {
                const demoUser = {
                    id: 'pat-demo',
                    name: 'Aarav Sharma',
                    age: 29,
                    gender: 'Male',
                    phone: '+91 98765 43210',
                    email: 'patient@medpulse.com',
                    address: 'Flat 402, Green Meadows, MG Road, Bangalore',
                    createdAt: new Date().toISOString()
                };
                this.setCurrentUser(demoUser);
                this.addSamplePrescription(demoUser);
                return demoUser;
            }
            throw new Error('No patient found with this email. Please register first.');
        }
        if (user.password && user.password !== password) {
            throw new Error('Incorrect password.');
        }
        this.setCurrentUser(user);
        return user;
    }

    logout() {
        this.setCurrentUser(null);
    }

    // Appointments
    getAppointments(patientEmail = null) {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
        if (patientEmail) {
            return list.filter(a => a.patientEmail?.toLowerCase() === patientEmail.toLowerCase());
        }
        return list;
    }

    createAppointment(apptData) {
        const appts = this.getAppointments();
        const newAppt = {
            id: 'APT-' + Math.floor(100000 + Math.random() * 900000),
            createdAt: new Date().toISOString(),
            status: apptData.mode === 'offline' ? 'Confirmed (Pay at Desk)' : 'Verified & Confirmed',
            paymentStatus: apptData.mode === 'offline' ? 'Pending (Desk)' : 'Paid (UPI Verified)',
            ...apptData
        };
        appts.unshift(newAppt);
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appts));

        // Automatically generate a draft / scheduled clinical record
        this.generateClinicalRecord(newAppt);

        return newAppt;
    }

    // Prescriptions
    getPrescriptions(patientEmail = null) {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS) || '[]');
        if (patientEmail) {
            return list.filter(p => p.patientEmail?.toLowerCase() === patientEmail.toLowerCase());
        }
        return list;
    }

    addPreviousPrescription(uploadData) {
        const list = this.getPrescriptions();
        const record = {
            id: 'PREV-' + Date.now(),
            type: 'uploaded', // 'uploaded' or 'electronic'
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            ...uploadData
        };
        list.unshift(record);
        localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(list));
        return record;
    }

    generateClinicalRecord(appt) {
        const list = this.getPrescriptions();
        const eRx = {
            id: 'EPX-' + Math.floor(10000 + Math.random() * 90000),
            type: 'electronic',
            appointmentId: appt.id,
            patientName: appt.patientName,
            patientEmail: appt.patientEmail,
            patientAge: appt.patientAge || '29',
            patientGender: appt.patientGender || 'Not Specified',
            doctorName: appt.doctorName,
            doctorSpecialty: appt.doctorSpecialty,
            date: appt.date,
            time: appt.slot,
            diagnosis: appt.symptoms ? `Primary Consult: ${appt.symptoms}` : 'General Health Assessment & Vital Signs Check',
            vitals: {
                bp: '120/80 mmHg',
                pulse: '74 bpm',
                spo2: '98%',
                temp: '98.4 F',
                weight: '68 kg'
            },
            medicines: [
                { name: 'Tab. Amoxicillin 500mg', dosage: '1 tablet twice a day (after food)', duration: '5 Days' },
                { name: 'Tab. Paracetamol 650mg', dosage: '1 tablet sos if pain or fever', duration: 'As needed' },
                { name: 'Multivitamin & Zinc Cap', dosage: '1 capsule once daily at bedtime', duration: '15 Days' }
            ],
            advice: 'Stay well hydrated with 2.5L clean fluids daily. Avoid heavy lifting and cold beverages. Follow-up review scheduled after 7 days if symptoms persist.',
            qrCodeData: `MEDPULSE-VERIFIED-RX-${appt.id}`,
            createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        list.unshift(eRx);
        localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(list));
    }

    addSamplePrescription(user) {
        const existing = this.getPrescriptions(user.email);
        if (existing.length === 0) {
            const sampleRx = {
                id: 'EPX-88219',
                type: 'electronic',
                patientName: user.name,
                patientEmail: user.email,
                patientAge: user.age,
                patientGender: user.gender,
                doctorName: 'Dr. Sarah Jenkins, MD',
                doctorSpecialty: 'Chief Cardiologist & Internal Medicine',
                date: 'Oct 08, 2026',
                time: '10:30 AM',
                diagnosis: 'Routine Cardiovascular & Blood Pressure Monitoring',
                vitals: {
                    bp: '118/78 mmHg',
                    pulse: '72 bpm',
                    spo2: '99%',
                    temp: '98.6 F',
                    weight: '70 kg'
                },
                medicines: [
                    { name: 'Tab. Telmisartan 40mg', dosage: '1 tablet once daily morning', duration: '30 Days' },
                    { name: 'Cap. Omega-3 Fish Oil 1000mg', dosage: '1 capsule post lunch', duration: '30 Days' },
                    { name: 'Tab. Vitamin D3 60,000 IU', dosage: '1 tablet weekly once with milk', duration: '4 Weeks' }
                ],
                advice: 'Maintain brisk 30 min walking routine. Low sodium diet (< 4g/day). Repeat lipid profile after 60 days.',
                qrCodeData: `MEDPULSE-VERIFIED-RX-88219`,
                createdAt: 'Oct 08, 2026'
            };
            const list = this.getPrescriptions();
            list.unshift(sampleRx);
            localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(list));
        }
    }
}

window.clinicStore = new ClinicStore();

