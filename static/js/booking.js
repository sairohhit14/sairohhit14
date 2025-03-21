/**
 * WellNow - Appointment Booking JavaScript
 * Handles appointment scheduling functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const appointmentForm = document.getElementById('appointmentForm');
    const specialtySelect = document.getElementById('specialtySelect');
    const doctorSelect = document.getElementById('doctorSelect');
    const appointmentDate = document.getElementById('appointmentDate');
    const appointmentTime = document.getElementById('appointmentTime');
    const onlineConsultation = document.getElementById('onlineConsultation');
    const inPersonConsultation = document.getElementById('inPersonConsultation');
    const reasonForVisit = document.getElementById('reasonForVisit');
    const bookingSuccess = document.getElementById('bookingSuccess');
    const bookingError = document.getElementById('bookingError');
    const bookingErrorMessage = document.getElementById('bookingErrorMessage');
    
    // Check if booking elements exist on the page
    if (!appointmentForm || !specialtySelect || !doctorSelect) {
        console.log('Booking elements not found on this page');
        return;
    }
    
    // Set minimum date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    appointmentDate.min = formattedDate;
    appointmentDate.value = formattedDate;
    
    // Map of doctors by specialty (this would be populated from the server in a real app)
    const doctorsBySpecialty = {
        'Cardiology': [
            { id: 1, name: 'Dr. Sarah Johnson', availability: true },
            { id: 6, name: 'Dr. Robert Williams', availability: true }
        ],
        'Neurology': [
            { id: 2, name: 'Dr. Michael Chen', availability: true },
            { id: 7, name: 'Dr. Lisa Patel', availability: false }
        ],
        'Pediatrics': [
            { id: 3, name: 'Dr. Emily Rodriguez', availability: true }
        ],
        'Orthopedics': [
            { id: 4, name: 'Dr. David Kim', availability: true }
        ],
        'Family Medicine': [
            { id: 5, name: 'Dr. Lisa Thompson', availability: true }
        ],
        'Dermatology': [
            { id: 8, name: 'Dr. John Smith', availability: true }
        ],
        'Internal Medicine': [
            { id: 9, name: 'Dr. Maria Garcia', availability: true }
        ],
        'Obstetrics & Gynecology': [
            { id: 10, name: 'Dr. Jennifer Adams', availability: true }
        ],
        'Ophthalmology': [
            { id: 11, name: 'Dr. James Wilson', availability: true }
        ],
        'Psychiatry': [
            { id: 12, name: 'Dr. Samantha Brown', availability: true }
        ]
    };
    
    // Event listeners
    specialtySelect.addEventListener('change', updateDoctorsList);
    appointmentDate.addEventListener('change', checkAvailability);
    
    // Handle form submission
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Get form data
        const appointmentData = {
            doctor_id: parseInt(doctorSelect.value),
            date: `${appointmentDate.value}T${appointmentTime.value}`,
            is_online: onlineConsultation.checked,
            notes: reasonForVisit.value
        };
        
        // Show loading state
        const submitButton = document.getElementById('bookAppointmentBtn');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Booking...';
        submitButton.disabled = true;
        
        // Make API request to book appointment
        fetch('/api/book_appointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData),
        })
        .then(response => response.json())
        .then(data => {
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            
            if (data.success) {
                // Show success message
                bookingSuccess.classList.remove('d-none');
                bookingError.classList.add('d-none');
                
                // Reset form
                appointmentForm.reset();
                
                // Update upcoming appointments section
                updateUpcomingAppointments(appointmentData);
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    bookingSuccess.classList.add('d-none');
                }, 5000);
            } else {
                // Show error message
                bookingError.classList.remove('d-none');
                bookingSuccess.classList.add('d-none');
                bookingErrorMessage.textContent = data.message || 'An error occurred during booking.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            
            // Show error message
            bookingError.classList.remove('d-none');
            bookingSuccess.classList.add('d-none');
            bookingErrorMessage.textContent = 'Network error. Please try again.';
        });
    });
    
    // Function to update the doctors dropdown based on selected specialty
    function updateDoctorsList() {
        const selectedSpecialty = specialtySelect.value;
        
        // Clear existing options
        doctorSelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = 'Select a doctor';
        doctorSelect.appendChild(defaultOption);
        
        // Get doctors for selected specialty
        const doctors = doctorsBySpecialty[selectedSpecialty] || [];
        
        // Add doctor options
        doctors.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = doctor.name;
            option.disabled = !doctor.availability;
            if (!doctor.availability) {
                option.textContent += ' (Not Available)';
            }
            doctorSelect.appendChild(option);
        });
    }
    
    // Function to check appointment availability
    function checkAvailability() {
        const selectedDate = appointmentDate.value;
        
        // Simulate checking for available time slots
        // In a real app, this would make an API request to get available time slots
        
        // For demo purposes, mark some time slots as unavailable
        const unavailableTimes = [];
        
        // If weekend, mark morning slots as unavailable
        const date = new Date(selectedDate);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        if (isWeekend) {
            unavailableTimes.push('09:00', '10:00');
        }
        
        // Clear existing options
        appointmentTime.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = 'Select a time slot';
        appointmentTime.appendChild(defaultOption);
        
        // Add time slot options
        const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
        
        timeSlots.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            
            // Format time for display (12-hour format)
            const hour = parseInt(time.split(':')[0]);
            const displayTime = hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
            option.textContent = displayTime;
            
            // Mark unavailable times
            if (unavailableTimes.includes(time)) {
                option.disabled = true;
                option.textContent += ' (Unavailable)';
            }
            
            appointmentTime.appendChild(option);
        });
    }
    
    // Function to validate the form
    function validateForm() {
        let isValid = true;
        
        if (!specialtySelect.value) {
            isValid = false;
            markInvalid(specialtySelect, 'Please select a specialty');
        } else {
            markValid(specialtySelect);
        }
        
        if (!doctorSelect.value) {
            isValid = false;
            markInvalid(doctorSelect, 'Please select a doctor');
        } else {
            markValid(doctorSelect);
        }
        
        if (!appointmentDate.value) {
            isValid = false;
            markInvalid(appointmentDate, 'Please select a date');
        } else {
            markValid(appointmentDate);
        }
        
        if (!appointmentTime.value) {
            isValid = false;
            markInvalid(appointmentTime, 'Please select a time');
        } else {
            markValid(appointmentTime);
        }
        
        return isValid;
    }
    
    // Function to mark form field as invalid
    function markInvalid(element, message) {
        element.classList.add('is-invalid');
        
        // Add feedback message if it doesn't exist
        let feedbackElement = element.nextElementSibling;
        if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'invalid-feedback';
            element.parentNode.insertBefore(feedbackElement, element.nextSibling);
        }
        
        feedbackElement.textContent = message;
    }
    
    // Function to mark form field as valid
    function markValid(element) {
        element.classList.remove('is-invalid');
        element.classList.add('is-valid');
    }
    
    // Function to update upcoming appointments section
    function updateUpcomingAppointments(appointmentData) {
        const upcomingAppointments = document.getElementById('upcomingAppointments');
        if (!upcomingAppointments) return;
        
        // Find doctor name from the selected doctor
        const selectedDoctorId = appointmentData.doctor_id;
        let doctorName = 'Doctor';
        
        // Search through all specialties to find the doctor
        Object.values(doctorsBySpecialty).forEach(doctors => {
            doctors.forEach(doctor => {
                if (doctor.id === selectedDoctorId) {
                    doctorName = doctor.name;
                }
            });
        });
        
        // Format date and time
        const appointmentDateTime = new Date(appointmentData.date);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = appointmentDateTime.toLocaleDateString('en-US', options);
        const formattedTime = appointmentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        
        // Create appointment card
        upcomingAppointments.innerHTML = `
            <div class="card border-primary mb-3">
                <div class="card-body">
                    <h5 class="card-title">${doctorName}</h5>
                    <p class="card-text">
                        <i class="fas fa-calendar-alt text-primary me-2"></i> ${formattedDate}<br>
                        <i class="fas fa-clock text-primary me-2"></i> ${formattedTime}<br>
                        <i class="fas ${appointmentData.is_online ? 'fa-video' : 'fa-hospital'} text-primary me-2"></i> 
                        ${appointmentData.is_online ? 'Online Consultation' : 'In-Person Visit'}
                    </p>
                    <div class="d-flex justify-content-between mt-3">
                        <span class="badge bg-success">Confirmed</span>
                        <button class="btn btn-sm btn-outline-primary">Reschedule</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Initialize the doctor list if a specialty is already selected
    if (specialtySelect.value) {
        updateDoctorsList();
    }
    
    // Initialize time slots
    checkAvailability();
});
