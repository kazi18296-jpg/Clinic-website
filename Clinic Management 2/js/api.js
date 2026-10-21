/**
 * MedPulse Advanced Clinic Management System
 * Backend API Client & Integration Bridge
 * Connects frontend smoothly to Django Backend APIs with fallback to LocalStorage
 */

const API_BASE = ''; // Same origin relative calls e.g. /api/...

const ApiService = {
    // Doctors
    async getDoctors() {
        try {
            const res = await fetch('/api/doctors/');
            if (!res.ok) throw new Error('API failed');
            const data = await res.json();
            if (data.status === 'success' && data.data.length > 0) {
                return data.data;
            }
        } catch (e) {
            console.warn('API error, falling back to local store', e);
        }
        return window.clinicStore.getDoctors();
    },

    // Notices
    async getNotices() {
        try {
            const res = await fetch('/api/notices/');
            if (!res.ok) throw new Error('API failed');
            const data = await res.json();
            if (data.status === 'success' && data.data.length > 0) {
                return data.data;
            }
        } catch (e) {
            console.warn('API error, falling back to local store', e);
        }
        return window.clinicStore.getNotices();
    },

    // Reviews
    async getReviews() {
        try {
            const res = await fetch('/api/reviews/');
            if (!res.ok) throw new Error('API failed');
            const data = await res.json();
            if (data.status === 'success' && data.data.length > 0) {
                return data.data;
            }
        } catch (e) {
            console.warn('API error, falling back to local store', e);
        }
        return window.clinicStore.getReviews();
    },

    async addReview(reviewData) {
        try {
            const res = await fetch('/api/reviews/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });
            if (res.ok) return await res.json();
        } catch (e) {
            console.warn('API error, fallback to local store', e);
        }
        return window.clinicStore.addReview(reviewData);
    },

    // Patient Auth
    async login(email, password) {
        try {
            const res = await fetch('/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok || data.status === 'error') {
                throw new Error(data.message || 'Login failed');
            }
            window.clinicStore.setCurrentUser(data.user);
            return data.user;
        } catch (e) {
            // Fallback for standalone preview
            return window.clinicStore.loginPatient(email, password);
        }
    },

    async register(patientData) {
        try {
            const res = await fetch('/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patientData)
            });
            const data = await res.json();
            if (!res.ok || data.status === 'error') {
                throw new Error(data.message || 'Registration failed');
            }
            window.clinicStore.setCurrentUser(data.user);
            return data.user;
        } catch (e) {
            return window.clinicStore.registerPatient(patientData);
        }
    },

    // Book Appointment
    async bookAppointment(formData) {
        try {
            const res = await fetch('/api/appointments/book/', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (!res.ok || data.status === 'error') {
                throw new Error(data.message || 'Booking failed');
            }
            return data.appointment;
        } catch (e) {
            console.warn('Backend book API fallback', e);
            // Convert FormData to object for fallback
            const plain = {};
            formData.forEach((val, key) => plain[key] = val);
            return window.clinicStore.createAppointment(plain);
        }
    },

    // Appointments for patient
    async getAppointments(email) {
        try {
            const res = await fetch(`/api/appointments/?email=${encodeURIComponent(email || '')}`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') return data.data;
            }
        } catch (e) {}
        return window.clinicStore.getAppointments(email);
    },

    // Prescriptions
    async getPrescriptions(email) {
        try {
            const res = await fetch(`/api/prescriptions/?email=${encodeURIComponent(email || '')}`);
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') return data.data;
            }
        } catch (e) {}
        return window.clinicStore.getPrescriptions(email);
    },

    async uploadPrescription(formData) {
        try {
            const res = await fetch('/api/prescriptions/upload/', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                return data.prescription;
            }
        } catch (e) {}
        return null;
    }
};

window.apiService = ApiService;

