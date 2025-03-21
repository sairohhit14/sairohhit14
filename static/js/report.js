/**
 * WellNow - Report Scanning JavaScript
 * Handles report uploads and management
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get page elements
    const reportUploadForm = document.getElementById('reportUploadForm');
    const reportFile = document.getElementById('report_file');
    const uploadButton = document.getElementById('uploadButton');
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadStatusText = document.getElementById('uploadStatusText');
    const uploadSuccess = document.getElementById('uploadSuccess');
    const uploadError = document.getElementById('uploadError');
    const errorMessage = document.getElementById('errorMessage');
    const reportsTable = document.getElementById('reportsTable');
    
    // Check if report elements exist on the page
    if (!reportUploadForm || !reportFile) {
        console.log('Report elements not found on this page');
        return;
    }
    
    // Sample reports data (this would be loaded from server in a real app)
    const sampleReports = [
        { id: 1, type: 'Blood Test', date: '2023-05-15', status: 'Analyzed' },
        { id: 2, type: 'X-Ray', date: '2023-04-22', status: 'Uploaded' }
    ];
    
    // Initialize reports table
    if (reportsTable) {
        updateReportsTable(sampleReports);
    }
    
    // Handle form submission
    reportUploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Get form data
        const formData = new FormData();
        formData.append('report_file', reportFile.files[0]);
        formData.append('description', document.getElementById('description').value);
        
        // Show upload status
        uploadStatus.classList.remove('d-none');
        uploadSuccess.classList.add('d-none');
        uploadError.classList.add('d-none');
        uploadButton.disabled = true;
        
        // Set up progress simulation
        let progress = 0;
        const progressInterval = setInterval(function() {
            progress += 5;
            if (progress > 90) {
                clearInterval(progressInterval);
            }
            uploadProgressBar.style.width = `${progress}%`;
            uploadProgressBar.setAttribute('aria-valuenow', progress);
        }, 200);
        
        // Upload file to server
        fetch('/api/upload_report', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            clearInterval(progressInterval);
            uploadProgressBar.style.width = '100%';
            uploadProgressBar.setAttribute('aria-valuenow', 100);
            
            setTimeout(() => {
                uploadStatus.classList.add('d-none');
                
                if (data.success) {
                    // Show success message
                    uploadSuccess.classList.remove('d-none');
                    
                    // Reset form
                    reportUploadForm.reset();
                    
                    // Update reports table with new upload
                    const newReport = {
                        id: Date.now(), // Use timestamp as temporary ID
                        type: document.getElementById('reportType').value,
                        date: document.getElementById('reportDate').value,
                        status: 'Uploaded'
                    };
                    
                    sampleReports.unshift(newReport);
                    updateReportsTable(sampleReports);
                } else {
                    // Show error message
                    uploadError.classList.remove('d-none');
                    errorMessage.textContent = data.error || 'An error occurred during upload.';
                }
                
                uploadButton.disabled = false;
            }, 500);
        })
        .catch(error => {
            console.error('Error:', error);
            clearInterval(progressInterval);
            
            uploadStatus.classList.add('d-none');
            uploadError.classList.remove('d-none');
            errorMessage.textContent = 'Network error. Please try again.';
            uploadButton.disabled = false;
        });
    });
    
    // File input change handler - validate file type and size
    reportFile.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            // Check file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                alert('Invalid file type. Please upload a PDF, JPG, PNG, DOC or DOCX file.');
                this.value = '';
                return;
            }
            
            // Check file size (10MB max)
            const maxSize = 10 * 1024 * 1024; // 10MB in bytes
            if (file.size > maxSize) {
                alert('File is too large. Maximum size is 10MB.');
                this.value = '';
                return;
            }
            
            // Display filename
            const fileNameElement = document.createElement('div');
            fileNameElement.className = 'selected-file-name mt-2';
            fileNameElement.innerHTML = `<i class="fas fa-file me-2"></i> ${file.name}`;
            
            // Remove previous filename display if exists
            const previousFileName = this.parentNode.querySelector('.selected-file-name');
            if (previousFileName) {
                previousFileName.remove();
            }
            
            this.parentNode.appendChild(fileNameElement);
        }
    });
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Check report type
        const reportType = document.getElementById('reportType');
        if (!reportType.value) {
            markInvalid(reportType, 'Please select a report type');
            isValid = false;
        } else {
            markValid(reportType);
        }
        
        // Check report date
        const reportDate = document.getElementById('reportDate');
        if (!reportDate.value) {
            markInvalid(reportDate, 'Please select the report date');
            isValid = false;
        } else {
            markValid(reportDate);
        }
        
        // Check file
        if (!reportFile.files.length) {
            markInvalid(reportFile, 'Please select a file to upload');
            isValid = false;
        } else {
            markValid(reportFile);
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
    
    // Function to update reports table
    function updateReportsTable(reports) {
        if (!reportsTable) return;
        
        if (reports.length === 0) {
            reportsTable.innerHTML = '<tr><td colspan="4" class="text-center">No reports uploaded yet</td></tr>';
            return;
        }
        
        let tableHTML = '';
        
        reports.forEach(report => {
            // Format date for display
            const reportDate = new Date(report.date);
            const formattedDate = reportDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            // Determine status badge class
            let statusBadgeClass = 'bg-secondary';
            if (report.status === 'Analyzed') {
                statusBadgeClass = 'bg-success';
            } else if (report.status === 'Processing') {
                statusBadgeClass = 'bg-warning';
            } else if (report.status === 'Error') {
                statusBadgeClass = 'bg-danger';
            }
            
            tableHTML += `
                <tr>
                    <td>${report.type}</td>
                    <td>${formattedDate}</td>
                    <td><span class="badge ${statusBadgeClass}">${report.status}</span></td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary view-report" data-report-id="${report.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-primary share-report" data-report-id="${report.id}">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <button class="btn btn-outline-danger delete-report" data-report-id="${report.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        reportsTable.innerHTML = tableHTML;
        
        // Add event listeners to report action buttons
        document.querySelectorAll('.view-report').forEach(button => {
            button.addEventListener('click', function() {
                const reportId = this.dataset.reportId;
                viewReport(reportId);
            });
        });
        
        document.querySelectorAll('.share-report').forEach(button => {
            button.addEventListener('click', function() {
                const reportId = this.dataset.reportId;
                shareReport(reportId);
            });
        });
        
        document.querySelectorAll('.delete-report').forEach(button => {
            button.addEventListener('click', function() {
                const reportId = this.dataset.reportId;
                deleteReport(reportId);
            });
        });
    }
    
    // Function to view report
    function viewReport(reportId) {
        // In a real app, this would open the report file or a detailed view
        alert(`Viewing report ID: ${reportId}`);
    }
    
    // Function to share report
    function shareReport(reportId) {
        // Create a modal for sharing options
        const modalHTML = `
            <div class="modal fade" id="shareReportModal" tabindex="-1" aria-labelledby="shareReportModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="shareReportModalLabel">Share Report</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="shareReportForm">
                                <div class="mb-3">
                                    <label for="shareWith" class="form-label">Share with</label>
                                    <select class="form-select" id="shareWith" required>
                                        <option value="" selected disabled>Select recipient</option>
                                        <option value="doctor">My Doctor</option>
                                        <option value="specialist">Specialist</option>
                                        <option value="family">Family Member</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3 d-none" id="otherRecipientField">
                                    <label for="otherRecipient" class="form-label">Recipient Email</label>
                                    <input type="email" class="form-control" id="otherRecipient" placeholder="name@example.com">
                                </div>
                                
                                <div class="mb-3">
                                    <label for="shareMessage" class="form-label">Message (Optional)</label>
                                    <textarea class="form-control" id="shareMessage" rows="3" placeholder="Add a note about this report"></textarea>
                                </div>
                                
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="notifyMe" checked>
                                    <label class="form-check-label" for="notifyMe">
                                        Notify me when recipient views the report
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="confirmShare">Share Report</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('shareReportModal'));
        modal.show();
        
        // Handle "other" recipient selection
        document.getElementById('shareWith').addEventListener('change', function() {
            const otherRecipientField = document.getElementById('otherRecipientField');
            if (this.value === 'other') {
                otherRecipientField.classList.remove('d-none');
            } else {
                otherRecipientField.classList.add('d-none');
            }
        });
        
        // Handle share confirmation
        document.getElementById('confirmShare').addEventListener('click', function() {
            const shareWith = document.getElementById('shareWith').value;
            
            if (!shareWith) {
                alert('Please select a recipient');
                return;
            }
            
            if (shareWith === 'other' && !document.getElementById('otherRecipient').value) {
                alert('Please enter recipient email');
                return;
            }
            
            // Simulate sharing process
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sharing...';
            this.disabled = true;
            
            setTimeout(() => {
                modal.hide();
                alert('Report shared successfully!');
            }, 1500);
        });
        
        // Remove modal from DOM when hidden
        document.getElementById('shareReportModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Function to delete report
    function deleteReport(reportId) {
        if (confirm('Are you sure you want to delete this report?')) {
            // Filter out the deleted report
            const updatedReports = sampleReports.filter(report => report.id != reportId);
            
            // Update the reports table
            updateReportsTable(updatedReports);
            
            // Update sample reports array
            while (sampleReports.length) { sampleReports.pop(); }
            updatedReports.forEach(report => sampleReports.push(report));
        }
    }
    
    // Add drag and drop functionality if supported
    if (window.FileReader) {
        // Convert file input to a drag and drop zone
        const fileInputContainer = reportFile.parentNode;
        fileInputContainer.classList.add('upload-zone');
        fileInputContainer.innerHTML = `
            <div class="text-center">
                <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                <p>Drag and drop your file here, or click to select</p>
                <p class="text-muted small">Accepted formats: PDF, JPG, PNG, DOC, DOCX. Max size: 10MB</p>
            </div>
            ${reportFile.outerHTML}
        `;
        
        // Hide the file input
        const newFileInput = fileInputContainer.querySelector('input[type="file"]');
        newFileInput.style.display = 'none';
        
        // Make the container clickable
        fileInputContainer.addEventListener('click', function(e) {
            if (e.target !== newFileInput) {
                newFileInput.click();
            }
        });
        
        // Add drag and drop event listeners
        fileInputContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('dragover');
        });
        
        fileInputContainer.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
        });
        
        fileInputContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                newFileInput.files = e.dataTransfer.files;
                
                // Trigger change event
                const event = new Event('change');
                newFileInput.dispatchEvent(event);
            }
        });
    }
});
