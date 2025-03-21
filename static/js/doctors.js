/**
 * MedAssist - Doctors Search JavaScript
 * Handles doctor search and filtering
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get page elements
    const doctorSearchForm = document.getElementById('doctorSearchForm');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const locationFilter = document.getElementById('locationFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    const searchDoctorsBtn = document.getElementById('searchDoctorsBtn');
    const doctorsResults = document.getElementById('doctorsResults');
    
    // Check if doctor search elements exist on the page
    if (!doctorSearchForm || !doctorsResults) {
        console.log('Doctor search elements not found on this page');
        return;
    }
    
    // Initialize with current doctors if available
    const initialDoctors = [];
    document.querySelectorAll('#doctorsResults .card').forEach(card => {
        const nameElement = card.querySelector('.card-title');
        const specialtyElement = card.querySelector('.text-muted');
        const locationElement = card.querySelector('.card-text');
        
        if (nameElement && specialtyElement && locationElement) {
            initialDoctors.push({
                name: nameElement.textContent,
                specialty: specialtyElement.textContent,
                location: locationElement.textContent.replace('Location: ', '')
            });
        }
    });
    
    // Handle search form submission
    doctorSearchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        searchDoctors();
    });
    
    // Function to search doctors
    function searchDoctors() {
        const specialty = specialtyFilter.value;
        const location = locationFilter.value;
        const availability = availabilityFilter.value;
        
        // Show loading state
        searchDoctorsBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...';
        searchDoctorsBtn.disabled = true;
        
        // Make API request to search doctors
        fetch(`/api/search_doctors?specialty=${encodeURIComponent(specialty)}&location=${encodeURIComponent(location)}`)
            .then(response => response.json())
            .then(data => {
                // Reset button state
                searchDoctorsBtn.innerHTML = '<i class="fas fa-search me-2"></i> Search Doctors';
                searchDoctorsBtn.disabled = false;
                
                // Process results
                displaySearchResults(data.doctors, availability);
            })
            .catch(error => {
                console.error('Error:', error);
                searchDoctorsBtn.innerHTML = '<i class="fas fa-search me-2"></i> Search Doctors';
                searchDoctorsBtn.disabled = false;
                
                // Show error message
                doctorsResults.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i> Error searching for doctors. Please try again.
                    </div>
                `;
            });
    }
    
    // Function to display search results
    function displaySearchResults(doctors, availabilityFilter) {
        // Filter by availability if selected
        if (availabilityFilter === 'today' || availabilityFilter === 'this_week' || availabilityFilter === 'next_week') {
            doctors = doctors.filter(doctor => doctor.availability === true);
        }
        
        // Check if we have results
        if (doctors.length === 0) {
            doctorsResults.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i> No doctors found matching your criteria. Please try different search terms.
                </div>
            `;
            return;
        }
        
        // Build results HTML
        let resultsHTML = '<div class="row">';
        
        doctors.forEach(doctor => {
            resultsHTML += `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="avatar-placeholder bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center">
                                    <i class="fas fa-user-md fa-2x"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-0">${doctor.name}</h5>
                                    <p class="text-muted mb-0">${doctor.specialty}</p>
                                </div>
                            </div>
                            <p><i class="fas fa-map-marker-alt text-primary me-2"></i> ${doctor.location}</p>
                            <div class="mb-3">
                                <span class="badge ${doctor.availability ? 'bg-success' : 'bg-secondary'} me-2">
                                    ${doctor.availability ? 'Available' : 'Limited Availability'}
                                </span>
                                <span class="badge bg-secondary">English</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <button class="btn btn-outline-primary view-profile" data-doctor-id="${doctor.id}">View Profile</button>
                                <a href="/booking" class="btn btn-primary">Book Now</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        
        // Add pagination if more than 6 results
        if (doctors.length > 6) {
            resultsHTML += `
                <nav aria-label="Doctor search results pages" class="mt-4">
                    <ul class="pagination justify-content-center">
                        <li class="page-item disabled">
                            <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                        </li>
                        <li class="page-item active" aria-current="page">
                            <a class="page-link" href="#">1</a>
                        </li>
                        <li class="page-item"><a class="page-link" href="#">2</a></li>
                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                        <li class="page-item">
                            <a class="page-link" href="#">Next</a>
                        </li>
                    </ul>
                </nav>
            `;
        }
        
        // Update results container
        doctorsResults.innerHTML = resultsHTML;
        
        // Add event listeners to view profile buttons
        document.querySelectorAll('.view-profile').forEach(button => {
            button.addEventListener('click', function() {
                const doctorId = this.dataset.doctorId;
                showDoctorProfile(doctorId);
            });
        });
    }
    
    // Function to show doctor profile modal
    function showDoctorProfile(doctorId) {
        // Find doctor in search results
        fetch(`/api/search_doctors`)
            .then(response => response.json())
            .then(data => {
                const doctor = data.doctors.find(d => d.id == doctorId);
                
                if (!doctor) {
                    console.error('Doctor not found:', doctorId);
                    return;
                }
                
                // Create modal HTML
                const modalHTML = `
                    <div class="modal fade" id="doctorProfileModal" tabindex="-1" aria-labelledby="doctorProfileModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header bg-primary text-white">
                                    <h5 class="modal-title" id="doctorProfileModalLabel">Doctor Profile</h5>
                                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="row">
                                        <div class="col-md-4 text-center mb-3 mb-md-0">
                                            <div class="avatar-placeholder bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 150px; height: 150px;">
                                                <i class="fas fa-user-md fa-5x"></i>
                                            </div>
                                            <h4>${doctor.name}</h4>
                                            <p class="text-muted">${doctor.specialty}</p>
                                            <div class="mb-3">
                                                <i class="fas fa-star text-warning"></i>
                                                <i class="fas fa-star text-warning"></i>
                                                <i class="fas fa-star text-warning"></i>
                                                <i class="fas fa-star text-warning"></i>
                                                <i class="fas fa-star-half-alt text-warning"></i>
                                                <span class="ms-2">4.5</span>
                                            </div>
                                        </div>
                                        <div class="col-md-8">
                                            <h5>About</h5>
                                            <p>Dr. ${doctor.name.split(' ')[1]} is an experienced ${doctor.specialty} specialist with over 10 years of clinical practice. They specialize in diagnosing and treating a wide range of conditions.</p>
                                            
                                            <h5>Contact Information</h5>
                                            <p><i class="fas fa-map-marker-alt text-primary me-2"></i> ${doctor.location}</p>
                                            <p><i class="fas fa-phone text-primary me-2"></i> (555) 123-4567</p>
                                            <p><i class="fas fa-envelope text-primary me-2"></i> dr.${doctor.name.split(' ')[1].toLowerCase()}@medassist.health</p>
                                            
                                            <h5>Education & Training</h5>
                                            <ul>
                                                <li>Medical School: University Medical Center</li>
                                                <li>Residency: General Hospital Training Program</li>
                                                <li>Fellowship: Specialty Institute</li>
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <hr>
                                    
                                    <h5>Available Appointment Times</h5>
                                    <div class="row mb-3">
                                        <div class="col-md-4 mb-2">
                                            <div class="card">
                                                <div class="card-body text-center">
                                                    <h6>Today</h6>
                                                    <p class="text-muted mb-0">2:00 PM, 4:00 PM</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <div class="card">
                                                <div class="card-body text-center">
                                                    <h6>Tomorrow</h6>
                                                    <p class="text-muted mb-0">9:00 AM, 11:00 AM, 3:00 PM</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <div class="card">
                                                <div class="card-body text-center">
                                                    <h6>Day After</h6>
                                                    <p class="text-muted mb-0">10:00 AM, 1:00 PM, 5:00 PM</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <a href="/booking" class="btn btn-primary">Book Appointment</a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add modal to body
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                
                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('doctorProfileModal'));
                modal.show();
                
                // Remove modal from DOM when hidden
                document.getElementById('doctorProfileModal').addEventListener('hidden.bs.modal', function() {
                    this.remove();
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error loading doctor profile. Please try again.');
            });
    }
    
    // Initialize page with mock data if empty
    if (doctorsResults.querySelector('.row') === null) {
        // Create a doctor array from sample doctors
        const mockDoctors = [
            { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", location: "Downtown Medical Center", availability: true },
            { id: 2, name: "Dr. Michael Chen", specialty: "Neurology", location: "West Side Hospital", availability: true },
            { id: 3, name: "Dr. Emily Rodriguez", specialty: "Pediatrics", location: "Children's Health Center", availability: true },
            { id: 4, name: "Dr. David Kim", specialty: "Orthopedics", location: "Sports Medicine Clinic", availability: true },
            { id: 5, name: "Dr. Lisa Thompson", specialty: "Family Medicine", location: "Community Health Services", availability: true }
        ];
        
        displaySearchResults(mockDoctors, '');
    }
});
