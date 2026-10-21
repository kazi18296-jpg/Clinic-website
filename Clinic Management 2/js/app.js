/**
 * MedPulse Advanced Clinic Management System
 * Interactive Logic, Appointment Booking Wizard, UPI QR Processing,
 * Prescription Uploads, E-Prescription Viewer, Modal Control & UI Animations
 */

// Application State
const AppState = {
    selectedDoctor: null,
    selectedDate: '',
    selectedSlot: '',
    bookingMode: 'online', // 'online' or 'offline'
    upiId: '',
    paymentScreenshot: null,
    qrUploaded: null,
    uploadedPrescriptions: []
};

// Toast notification helper
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// Global Modal handlers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modals on outside click or ESC
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.active').forEach(m => {
            m.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }
});

// Switch tabs / pages
function navigateToSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Authentication UI Synchronization
function updateAuthUI() {
    const user = window.clinicStore.getCurrentUser();
    const navAuthContainer = document.getElementById('nav-auth-actions');
    if (!navAuthContainer) return;

    if (user) {
        navAuthContainer.innerHTML = `
            <div class="user-avatar-btn" onclick="openPatientPortal()">
                <div class="user-avatar-circle">${user.name.charAt(0).toUpperCase()}</div>
                <span>Hi, ${user.name.split(' ')[0]}</span>
                <i class="fas fa-chevron-down" style="font-size: 0.75rem;"></i>
            </div>
            <button class="btn btn-outline btn-sm" onclick="handleLogout()">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    } else {
        navAuthContainer.innerHTML = `
            <button class="btn btn-secondary btn-sm" onclick="openModal('auth-modal'); switchAuthTab('login');">
                <i class="fas fa-user"></i> Login
            </button>
            <button class="btn btn-primary btn-sm" onclick="openModal('auth-modal'); switchAuthTab('register');">
                <i class="fas fa-user-plus"></i> Register
            </button>
        `;
    }
}

function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form-pane');
    const registerForm = document.getElementById('register-form-pane');
    const loginTabBtn = document.getElementById('tab-btn-login');
    const registerTabBtn = document.getElementById('tab-btn-register');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
    }
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const user = window.clinicStore.loginPatient(email, password);
        showToast(`Welcome back, ${user.name}!`, 'success');
        closeModal('auth-modal');
        updateAuthUI();
        refreshPortalData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const age = document.getElementById('reg-age').value.trim();
    const gender = document.getElementById('reg-gender').value;
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const password = document.getElementById('reg-password').value;

    if (!name || !age || !phone || !email || !address) {
        showToast('Please fill all mandatory fields.', 'error');
        return;
    }

    try {
        const user = window.clinicStore.registerPatient({
            name, age, gender, phone, email, address, password
        });
        showToast(`Registration successful! Welcome to MedPulse, ${user.name}.`, 'success');
        closeModal('auth-modal');
        updateAuthUI();
        refreshPortalData();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function handleLogout() {
    window.clinicStore.logout();
    showToast('You have been logged out safely.', 'info');
    updateAuthUI();
    closeModal('portal-modal');
}

// Render Doctors in Catalog & Appointment Selector
function renderDoctors() {
    const doctors = window.clinicStore.getDoctors();
    const grid = document.getElementById('doctors-list');
    const doctorSelect = document.getElementById('booking-doctor-select');

    if (grid) {
        grid.innerHTML = doctors.map(doc => `
            <div class="glass-card doctor-card">
                <div class="doctor-header">
                    <img src="${doc.img}" alt="${doc.name}" class="doctor-img">
                    <div class="doctor-info">
                        <h4>${doc.name}</h4>
                        <span>${doc.specialty}</span>
                        <div style="font-size: 0.8rem; color: #f59e0b; margin-top: 4px;">
                            <i class="fas fa-star"></i> <strong>${doc.rating}</strong> (${doc.reviewsCount} reviews)
                        </div>
                    </div>
                </div>
                <div class="doctor-meta">
                    <div>
                        <span class="text-muted"><i class="fas fa-briefcase"></i> Experience</span>
                        <p><strong>${doc.exp}</strong></p>
                    </div>
                    <div>
                        <span class="text-muted"><i class="fas fa-calendar-alt"></i> Available</span>
                        <p><strong>${doc.availableDays.join(', ')}</strong></p>
                    </div>
                    <div>
                        <span class="text-muted"><i class="fas fa-tag"></i> Fee</span>
                        <p class="doctor-fee text-primary">₹${doc.fee}</p>
                    </div>
                </div>
                <div style="margin-top: auto; display: flex; gap: 0.75rem;">
                    <button class="btn btn-primary" style="flex: 1;" onclick="startBookingForDoctor('${doc.id}')">
                        <i class="fas fa-calendar-check"></i> Book Appointment
                    </button>
                    <button class="btn btn-secondary" onclick="viewDoctorDetails('${doc.id}')" title="Doctor Profile">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    if (doctorSelect) {
        doctorSelect.innerHTML = '<option value="">-- Choose Specialist Doctor --</option>' + 
            doctors.map(d => `<option value="${d.id}">${d.name} (${d.specialty}) - ₹${d.fee}</option>`).join('');
        
        doctorSelect.addEventListener('change', (e) => {
            const found = doctors.find(d => d.id === e.target.value);
            AppState.selectedDoctor = found || null;
            updateBookingSummary();
            renderSlotPicker();
        });
    }
}

function startBookingForDoctor(docId) {
    const doctors = window.clinicStore.getDoctors();
    const doc = doctors.find(d => d.id === docId);
    if (!doc) return;

    AppState.selectedDoctor = doc;
    const doctorSelect = document.getElementById('booking-doctor-select');
    if (doctorSelect) doctorSelect.value = docId;

    document.getElementById('booking-wizard-section').scrollIntoView({ behavior: 'smooth' });
    setBookingWizardStep(1);
    updateBookingSummary();
    renderSlotPicker();
}

function viewDoctorDetails(docId) {
    const doctors = window.clinicStore.getDoctors();
    const doc = doctors.find(d => d.id === docId);
    if (!doc) return;
    alert(`Doctor Profile:\n\n${doc.name}\n${doc.specialty}\nExperience: ${doc.exp}\nConsultation Fee: ₹${doc.fee}\nDays: ${doc.availableDays.join(', ')}`);
}

// Date & Time Slot Picker logic
function initDateSlotPicker() {
    const dateInput = document.getElementById('booking-date-input');
    if (!dateInput) return;

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
    AppState.selectedDate = today;

    dateInput.addEventListener('change', (e) => {
        AppState.selectedDate = e.target.value;
        renderSlotPicker();
        updateBookingSummary();
    });

    renderSlotPicker();
}

function renderSlotPicker() {
    const slotContainer = document.getElementById('time-slots-container');
    if (!slotContainer) return;

    const doc = AppState.selectedDoctor;
    const slots = doc ? doc.slots : ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM', '05:30 PM'];

    let html = `
        <div class="slot-category-title"><i class="fas fa-sun text-warning"></i> Morning Slots</div>
        <div class="slots-grid">
    `;

    slots.filter(s => s.includes('AM')).forEach(s => {
        const isSel = AppState.selectedSlot === s ? 'selected' : '';
        html += `<button type="button" class="slot-btn ${isSel}" onclick="selectTimeSlot('${s}')">${s}</button>`;
    });

    html += `
        </div>
        <div class="slot-category-title" style="margin-top: 1.25rem;"><i class="fas fa-cloud-sun text-primary"></i> Afternoon & Evening Slots</div>
        <div class="slots-grid">
    `;

    slots.filter(s => s.includes('PM')).forEach(s => {
        const isSel = AppState.selectedSlot === s ? 'selected' : '';
        html += `<button type="button" class="slot-btn ${isSel}" onclick="selectTimeSlot('${s}')">${s}</button>`;
    });

    html += `</div>`;
    slotContainer.innerHTML = html;
}

function selectTimeSlot(slot) {
    AppState.selectedSlot = slot;
    renderSlotPicker();
    updateBookingSummary();
}

// Wizard Step Navigation
function setBookingWizardStep(step) {
    // Validate prior steps
    if (step === 2) {
        if (!AppState.selectedDoctor) {
            showToast('Please select a doctor to proceed.', 'error');
            return;
        }
        if (!AppState.selectedDate || !AppState.selectedSlot) {
            showToast('Please select an appointment date and time slot.', 'error');
            return;
        }
    }

    if (step === 3) {
        const name = document.getElementById('book-pat-name').value.trim();
        const phone = document.getElementById('book-pat-phone').value.trim();
        const email = document.getElementById('book-pat-email').value.trim();

        if (!name || !phone || !email) {
            showToast('Please provide patient name, contact number, and email.', 'error');
            return;
        }
    }

    // Update Step tabs UI
    document.querySelectorAll('.wizard-step-tab').forEach((tab, idx) => {
        const stepNum = idx + 1;
        tab.classList.remove('active');
        if (stepNum === step) {
            tab.classList.add('active');
        }
        if (stepNum < step) {
            tab.classList.add('completed');
        }
    });

    // Update step visibility
    for (let i = 1; i <= 3; i++) {
        const stepPane = document.getElementById(`wizard-step-pane-${i}`);
        if (stepPane) {
            stepPane.style.display = i === step ? 'block' : 'none';
        }
    }

    updateBookingSummary();
}

// Selection of offline vs online booking mode
function selectBookingMode(mode) {
    AppState.bookingMode = mode;
    document.getElementById('mode-card-online').classList.toggle('selected', mode === 'online');
    document.getElementById('mode-card-offline').classList.toggle('selected', mode === 'offline');

    const onlineSection = document.getElementById('online-payment-details');
    const offlineNotice = document.getElementById('offline-payment-notice');
    if (onlineSection && offlineNotice) {
        if (mode === 'online') {
            onlineSection.style.display = 'block';
            offlineNotice.style.display = 'none';
        } else {
            onlineSection.style.display = 'none';
            offlineNotice.style.display = 'block';
        }
    }
}

// Handle Custom QR Code Upload & Display
function handleCustomQRUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            AppState.qrUploaded = e.target.result;
            const qrImg = document.getElementById('clinic-display-qr');
            if (qrImg) qrImg.src = e.target.result;
            showToast('Custom payment QR code updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Handle Payment Screenshot Upload
function handlePaymentScreenshotUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            AppState.paymentScreenshot = {
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                data: e.target.result
            };
            const previewContainer = document.getElementById('payment-screenshot-preview');
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <div class="upload-preview-item">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <i class="fas fa-file-image text-primary" style="font-size: 1.5rem;"></i>
                            <div>
                                <p style="font-weight: 700; margin: 0; font-size: 0.9rem;">${file.name}</p>
                                <span style="font-size: 0.75rem; color: #64748b;">${(file.size / 1024).toFixed(1)} KB (Attached)</span>
                            </div>
                        </div>
                        <button type="button" class="btn btn-outline btn-sm" onclick="removePaymentScreenshot()"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            }
            showToast('Payment screenshot attached successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function removePaymentScreenshot() {
    AppState.paymentScreenshot = null;
    const previewContainer = document.getElementById('payment-screenshot-preview');
    if (previewContainer) previewContainer.innerHTML = '';
}

// Summary Calculation
function updateBookingSummary() {
    const fee = AppState.selectedDoctor ? AppState.selectedDoctor.fee : 500;
    const tax = Math.round(fee * 0.05);
    const total = fee + tax;

    const sumDoc = document.getElementById('summary-doctor-name');
    const sumSpec = document.getElementById('summary-doctor-spec');
    const sumDate = document.getElementById('summary-date');
    const sumSlot = document.getElementById('summary-slot');
    const sumFee = document.getElementById('summary-fee');
    const sumTax = document.getElementById('summary-tax');
    const sumTotal = document.getElementById('summary-total');

    if (sumDoc) sumDoc.textContent = AppState.selectedDoctor ? AppState.selectedDoctor.name : 'Select Specialist';
    if (sumSpec) sumSpec.textContent = AppState.selectedDoctor ? AppState.selectedDoctor.specialty : '--';
    if (sumDate) sumDate.textContent = AppState.selectedDate || 'Select Date';
    if (sumSlot) sumSlot.textContent = AppState.selectedSlot || 'Select Slot';
    if (sumFee) sumFee.textContent = `₹${fee}`;
    if (sumTax) sumTax.textContent = `₹${tax}`;
    if (sumTotal) sumTotal.textContent = `₹${total}`;

    // Update UPI Amount label
    const upiAmtText = document.getElementById('upi-total-amount');
    if (upiAmtText) upiAmtText.textContent = `₹${total}`;
}

// Final Submit Appointment
function handleFinalBookingSubmit() {
    const name = document.getElementById('book-pat-name').value.trim();
    const phone = document.getElementById('book-pat-phone').value.trim();
    const email = document.getElementById('book-pat-email').value.trim();
    const age = document.getElementById('book-pat-age').value.trim() || '30';
    const gender = document.getElementById('book-pat-gender').value || 'Not Specified';
    const symptoms = document.getElementById('book-pat-symptoms').value.trim();

    if (AppState.bookingMode === 'online') {
        const upiId = document.getElementById('upi-id-input').value.trim();
        if (!upiId) {
            showToast('Please enter your UPI ID or Reference Number for online verification.', 'error');
            return;
        }
        if (!AppState.paymentScreenshot) {
            showToast('Please upload payment screenshot proof to confirm instant verification.', 'error');
            return;
        }
        AppState.upiId = upiId;
    }

    // Prepare payload for backend API
    const formData = new FormData();
    formData.append('doctorId', AppState.selectedDoctor ? AppState.selectedDoctor.id : 'DOC101');
    formData.append('date', AppState.selectedDate);
    formData.append('slot', AppState.selectedSlot);
    formData.append('mode', AppState.bookingMode);
    formData.append('patientName', name);
    formData.append('patientPhone', phone);
    formData.append('patientEmail', email);
    formData.append('patientAge', age);
    formData.append('patientGender', gender);
    formData.append('symptoms', symptoms);
    formData.append('upiId', AppState.upiId || 'N/A (Desk Payment)');
    
    const fileInput = document.getElementById('payment-screenshot-file');
    if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('screenshot', fileInput.files[0]);
    }

    // Call API and store locally for instant UI update
    window.apiService.bookAppointment(formData).then(newAppt => {
        // Also save to clinicStore for instant client UI update
        window.clinicStore.createAppointment({
            id: newAppt.id,
            doctorName: newAppt.doctorName || AppState.selectedDoctor.name,
            doctorSpecialty: newAppt.doctorSpecialty || AppState.selectedDoctor.specialty,
            fee: newAppt.fee || AppState.selectedDoctor.fee,
            date: newAppt.date || AppState.selectedDate,
            slot: newAppt.slot || AppState.selectedSlot,
            mode: newAppt.mode || AppState.bookingMode,
            patientName: name,
            patientPhone: phone,
            patientEmail: email,
            patientAge: age,
            patientGender: gender,
            symptoms: symptoms,
            upiId: AppState.upiId || 'N/A (Desk Payment)',
            screenshot: AppState.paymentScreenshot ? AppState.paymentScreenshot.name : 'None'
        });

        // Populate Success Modal
        document.getElementById('confirm-appt-id').textContent = newAppt.id;
        document.getElementById('confirm-doc-name').textContent = newAppt.doctorName || (AppState.selectedDoctor ? AppState.selectedDoctor.name : 'Doctor');
        document.getElementById('confirm-datetime').textContent = `${newAppt.date || AppState.selectedDate} at ${newAppt.slot || AppState.selectedSlot}`;
        document.getElementById('confirm-mode').textContent = (newAppt.mode || AppState.bookingMode) === 'online' ? 'Online Slot (Instant UPI Verified)' : 'Offline Clinic Visit (Pay at Desk)';
        document.getElementById('confirm-status').textContent = newAppt.status || 'Confirmed';

        openModal('booking-confirmation-modal');
        showToast('Appointment successfully confirmed & synced to Doctor Dashboard!', 'success');

        // Reset wizard
        AppState.selectedSlot = '';
        AppState.paymentScreenshot = null;
        setBookingWizardStep(1);
        refreshPortalData();
    }).catch(err => {
        console.error(err);
        showToast('Booking failed. Please try again.', 'error');
    });
}

// Prescription Management
function handlePrescriptionFileUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const notes = document.getElementById('upload-rx-notes').value.trim();
        const reader = new FileReader();

        reader.onload = function(e) {
            const user = window.clinicStore.getCurrentUser();
            const record = window.clinicStore.addPreviousPrescription({
                patientName: user ? user.name : 'Guest Patient',
                patientEmail: user ? user.email : 'guest@medpulse.com',
                title: file.name,
                fileName: file.name,
                fileSize: (file.size / 1024).toFixed(1) + ' KB',
                dataUrl: e.target.result,
                notes: notes || 'Previous medical history record'
            });

            showToast('Prescription document uploaded successfully!', 'success');
            document.getElementById('upload-rx-notes').value = '';
            input.value = '';
            renderPrescriptionsList();
        };
        reader.readAsDataURL(file);
    }
}

function renderPrescriptionsList() {
    const container = document.getElementById('prescriptions-records-list');
    if (!container) return;

    const user = window.clinicStore.getCurrentUser();
    const list = window.clinicStore.getPrescriptions(user ? user.email : null);

    if (list.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2.5rem; color: #94a3b8;">
                <i class="fas fa-file-medical-alt" style="font-size: 3rem; margin-bottom: 0.75rem;"></i>
                <p>No prescriptions or records found yet. Book an appointment or upload previous records above.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = list.map(item => {
        if (item.type === 'electronic') {
            return `
                <div class="glass-card" style="padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid var(--primary);">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                            <i class="fas fa-file-prescription"></i>
                        </div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <h4 style="margin: 0;">E-Prescription (${item.id})</h4>
                                <span class="badge-tag badge-primary" style="margin: 0; padding: 0.15rem 0.5rem; font-size: 0.7rem;">Official Rx</span>
                            </div>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0.2rem 0 0 0;">
                                Issued by ${item.doctorName} • ${item.date}
                            </p>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="openEPrescriptionModal('${item.id}')">
                        <i class="fas fa-eye"></i> View E-Prescription
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="glass-card" style="padding: 1.25rem 1.5rem; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid var(--secondary);">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--secondary-light); color: var(--secondary); display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                            <i class="fas fa-file-upload"></i>
                        </div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <h4 style="margin: 0;">${item.fileName}</h4>
                                <span class="badge-tag badge-success" style="margin: 0; padding: 0.15rem 0.5rem; font-size: 0.7rem;">Uploaded Copy</span>
                            </div>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0.2rem 0 0 0;">
                                ${item.fileSize} • Uploaded on ${item.createdAt} • ${item.notes}
                            </p>
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="viewUploadedPrescription('${item.id}')">
                        <i class="fas fa-external-link-alt"></i> View File
                    </button>
                </div>
            `;
        }
    }).join('');
}

function openEPrescriptionModal(rxId) {
    const list = window.clinicStore.getPrescriptions();
    const rx = list.find(r => r.id === rxId);
    if (!rx) return;

    document.getElementById('eprx-id-tag').textContent = rx.id;
    document.getElementById('eprx-date-tag').textContent = rx.date || rx.createdAt;
    document.getElementById('eprx-doc-name').textContent = rx.doctorName;
    document.getElementById('eprx-doc-spec').textContent = rx.doctorSpecialty;
    document.getElementById('eprx-patient-name').textContent = rx.patientName;
    document.getElementById('eprx-patient-age').textContent = rx.patientAge;
    document.getElementById('eprx-patient-gender').textContent = rx.patientGender;
    document.getElementById('eprx-diagnosis').textContent = rx.diagnosis;
    
    // Vitals
    document.getElementById('eprx-bp').textContent = rx.vitals ? rx.vitals.bp : '120/80 mmHg';
    document.getElementById('eprx-pulse').textContent = rx.vitals ? rx.vitals.pulse : '72 bpm';
    document.getElementById('eprx-spo2').textContent = rx.vitals ? rx.vitals.spo2 : '99%';

    // Medicine rows
    const tbody = document.getElementById('eprx-meds-body');
    if (tbody) {
        tbody.innerHTML = (rx.medicines || []).map((med, idx) => `
            <tr>
                <td><strong>#${idx + 1}</strong></td>
                <td><strong>${med.name}</strong></td>
                <td>${med.dosage}</td>
                <td><span class="badge-tag badge-primary" style="margin: 0; padding: 0.2rem 0.5rem;">${med.duration}</span></td>
            </tr>
        `).join('');
    }

    document.getElementById('eprx-advice').textContent = rx.advice;
    document.getElementById('eprx-qr-code').src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(rx.qrCodeData || rx.id)}`;

    openModal('eprescription-modal');
}

function printEPrescription() {
    window.print();
}

function viewUploadedPrescription(id) {
    const list = window.clinicStore.getPrescriptions();
    const item = list.find(r => r.id === id);
    if (!item) return;

    if (item.dataUrl) {
        const w = window.open("");
        w.document.write(`<img src="${item.dataUrl}" style="max-width: 100%; height: auto; display: block; margin: auto;"/>`);
    } else {
        alert(`Document: ${item.fileName}\nNotes: ${item.notes}`);
    }
}

// Notice Board Dynamic Rendering
function renderNotices() {
    const notices = window.clinicStore.getNotices();
    const container = document.getElementById('notices-grid');
    const ticker = document.getElementById('ticker-headlines');

    if (ticker && notices.length > 0) {
        ticker.innerHTML = notices.map(n => `
            <span><strong class="text-primary">${n.category}:</strong> ${n.title} (${n.date})</span>
        `).join('<span style="margin: 0 1rem; color: #475569;">|</span>');
    }

    if (container) {
        container.innerHTML = notices.map(n => `
            <div class="glass-card notice-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
                    <span class="badge-tag badge-primary"><i class="fas ${n.icon}"></i> ${n.category}</span>
                    <span style="font-size: 0.8rem; color: #94a3b8; font-weight: 600;">${n.date}</span>
                </div>
                <h4 style="font-size: 1.15rem; margin-bottom: 0.6rem;">${n.title}</h4>
                <p style="font-size: 0.925rem; color: #475569; line-height: 1.6;">${n.summary}</p>
                <div style="margin-top: 1.25rem;">
                    <a href="#appointment-booking" class="btn btn-outline btn-sm">
                        <i class="fas fa-arrow-right"></i> Relevant Camp Action
                    </a>
                </div>
            </div>
        `).join('');
    }
}

// Patient Reviews Dynamic Rendering & Review Submission
function renderReviews() {
    const reviews = window.clinicStore.getReviews();
    const container = document.getElementById('reviews-grid');
    if (!container) return;

    container.innerHTML = reviews.map(r => `
        <div class="glass-card review-card">
            <div>
                <div class="stars-rating">
                    ${'<i class="fas fa-star"></i>'.repeat(Math.floor(r.rating))}
                    ${r.rating % 1 !== 0 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                </div>
                <p style="font-style: italic; color: #334155; margin-bottom: 1.25rem; font-size: 0.95rem; line-height: 1.6;">
                    "${r.comment}"
                </p>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 1rem;">
                <div>
                    <h5 style="margin: 0; font-size: 0.95rem;">${r.name} ${r.age ? `(${r.age} yrs)` : ''}</h5>
                    <span style="font-size: 0.78rem; color: #0284c7; font-weight: 600;">${r.treatment}</span>
                </div>
                <span class="badge-tag badge-success" style="margin: 0; font-size: 0.7rem; padding: 0.2rem 0.5rem;">
                    <i class="fas fa-badge-check"></i> Verified
                </span>
            </div>
        </div>
    `).join('');
}

function handleAddReviewSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('review-author-name').value.trim();
    const treatment = document.getElementById('review-treatment-name').value.trim();
    const rating = parseFloat(document.getElementById('review-rating-select').value);
    const comment = document.getElementById('review-comment-text').value.trim();

    if (!name || !treatment || !comment) {
        showToast('Please fill all review details.', 'error');
        return;
    }

    window.clinicStore.addReview({
        name, treatment, rating, comment
    });

    showToast('Thank you! Your patient review has been posted.', 'success');
    closeModal('add-review-modal');
    renderReviews();

    document.getElementById('review-author-name').value = '';
    document.getElementById('review-treatment-name').value = '';
    document.getElementById('review-comment-text').value = '';
}

// Patient Portal Sync
function openPatientPortal() {
    const user = window.clinicStore.getCurrentUser();
    if (!user) {
        openModal('auth-modal');
        switchAuthTab('login');
        return;
    }
    refreshPortalData();
    openModal('portal-modal');
}

function refreshPortalData() {
    const user = window.clinicStore.getCurrentUser();
    if (!user) return;

    // Fill profile fields
    const portalName = document.getElementById('portal-user-name');
    const portalEmail = document.getElementById('portal-user-email');
    const portalPhone = document.getElementById('portal-user-phone');
    const portalAddr = document.getElementById('portal-user-addr');
    const portalGender = document.getElementById('portal-user-gender');

    if (portalName) portalName.textContent = user.name;
    if (portalEmail) portalEmail.textContent = user.email;
    if (portalPhone) portalPhone.textContent = user.phone;
    if (portalAddr) portalAddr.textContent = user.address;
    if (portalGender) portalGender.textContent = `${user.gender || 'Not specified'}, Age: ${user.age || 'N/A'}`;

    // Fill auto-populate inputs in booking wizard
    const bName = document.getElementById('book-pat-name');
    const bPhone = document.getElementById('book-pat-phone');
    const bEmail = document.getElementById('book-pat-email');
    const bAge = document.getElementById('book-pat-age');
    const bGender = document.getElementById('book-pat-gender');

    if (bName && !bName.value) bName.value = user.name;
    if (bPhone && !bPhone.value) bPhone.value = user.phone;
    if (bEmail && !bEmail.value) bEmail.value = user.email;
    if (bAge && !bAge.value) bAge.value = user.age || '';
    if (bGender && !bGender.value) bGender.value = user.gender || 'Male';

    // Appointments in portal
    const appts = window.clinicStore.getAppointments(user.email);
    const apptsList = document.getElementById('portal-appointments-list');
    if (apptsList) {
        if (appts.length === 0) {
            apptsList.innerHTML = `<p style="color: #94a3b8; font-size: 0.9rem;">No appointments booked yet.</p>`;
        } else {
            apptsList.innerHTML = appts.map(a => `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.9rem; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <strong style="color: #0f172a;">${a.doctorName}</strong>
                        <span class="badge-tag badge-primary" style="margin: 0; font-size: 0.7rem; padding: 0.2rem 0.5rem;">${a.id}</span>
                    </div>
                    <div style="font-size: 0.85rem; color: #64748b; margin-top: 0.3rem;">
                        <i class="fas fa-calendar-alt"></i> ${a.date} at ${a.slot} • <strong>${a.status}</strong>
                    </div>
                </div>
            `).join('');
        }
    }

    renderPrescriptionsList();
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    renderDoctors();
    initDateSlotPicker();
    renderNotices();
    renderReviews();
    renderPrescriptionsList();

    // Fill default doctor in AppState
    const doctors = window.clinicStore.getDoctors();
    if (doctors.length > 0) {
        AppState.selectedDoctor = doctors[0];
        updateBookingSummary();
    }

    // Scroll Navbar Effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('main-navbar');
        if (window.scrollY > 40) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
});

