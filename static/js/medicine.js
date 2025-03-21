/**
 * WellNow - Medicine Ordering JavaScript
 * Handles medicine search, filtering, and ordering
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get page elements
    const medicineSearch = document.getElementById('medicineSearch');
    const searchButton = document.getElementById('searchButton');
    const medicineTabs = document.getElementById('medicineTabs');
    const medicineList = document.getElementById('medicineList');
    const cartItems = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryFeeElement = document.getElementById('deliveryFee');
    const totalPriceElement = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const orderForm = document.getElementById('orderForm');
    const orderSuccess = document.getElementById('orderSuccess');
    const orderId = document.getElementById('orderId');
    const prescriptionForm = document.getElementById('prescriptionForm');
    
    // Check if medicine elements exist on the page
    if (!medicineList || !cartItems) {
        console.log('Medicine ordering elements not found on this page');
        return;
    }
    
    // Initialize cart
    let cart = [];
    const deliveryFee = 5.00;
    
    // Medicine database (this would come from the server in a real application)
    const medicines = [
        { id: 1, name: 'Amoxicillin', description: 'Antibiotic for bacterial infections', price: 12.99, category: 'prescription', inStock: true },
        { id: 2, name: 'Lisinopril', description: 'Used for high blood pressure', price: 15.50, category: 'prescription', inStock: true },
        { id: 3, name: 'Metformin', description: 'Treatment for type 2 diabetes', price: 8.75, category: 'prescription', inStock: true },
        { id: 4, name: 'Atorvastatin', description: 'Lowers cholesterol levels', price: 22.30, category: 'prescription', inStock: true },
        { id: 5, name: 'Albuterol', description: 'Treats asthma and other breathing conditions', price: 18.99, category: 'prescription', inStock: true },
        { id: 6, name: 'Ibuprofen', description: 'Pain reliever and fever reducer', price: 5.99, category: 'otc', inStock: true },
        { id: 7, name: 'Acetaminophen', description: 'Pain reliever and fever reducer', price: 4.99, category: 'otc', inStock: true },
        { id: 8, name: 'Cetirizine', description: 'Antihistamine for allergies', price: 8.50, category: 'otc', inStock: true },
        { id: 9, name: 'Multivitamin', description: 'Daily nutritional supplement', price: 12.99, category: 'supplements', inStock: true },
        { id: 10, name: 'Vitamin D3', description: 'Supports bone health', price: 7.99, category: 'supplements', inStock: true },
        { id: 11, name: 'Calcium + Magnesium', description: 'Supports bone and muscle health', price: 9.99, category: 'supplements', inStock: true },
        { id: 12, name: 'Omega-3 Fish Oil', description: 'Supports heart and brain health', price: 14.99, category: 'supplements', inStock: true }
    ];
    
    // Event listeners
    
    // Medicine search
    if (searchButton) {
        searchButton.addEventListener('click', searchMedicines);
    }
    
    if (medicineSearch) {
        medicineSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchMedicines();
            }
        });
    }
    
    // Tab switching
    if (medicineTabs) {
        medicineTabs.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
                const category = e.target.id.replace('-tab', '');
                displayMedicines(category);
            }
        });
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                checkoutForm.classList.remove('d-none');
                window.scrollTo({
                    top: checkoutForm.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Order form submission
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const deliveryAddress = document.getElementById('deliveryAddress').value;
            const contactPhone = document.getElementById('contactPhone').value;
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').id;
            
            if (!deliveryAddress || !contactPhone) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Prepare order data
            const orderItems = cart.map(item => ({
                medicine_id: item.id,
                quantity: item.quantity
            }));
            
            const orderData = {
                items: orderItems,
                delivery_address: deliveryAddress
            };
            
            // Show loading state
            const submitButton = orderForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
            submitButton.disabled = true;
            
            // Submit order to server
            fetch('/api/order_medicine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            })
            .then(response => response.json())
            .then(data => {
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                
                if (data.success) {
                    // Show success message
                    orderSuccess.classList.remove('d-none');
                    if (orderId) {
                        orderId.textContent = data.order_id;
                    }
                    
                    // Reset cart and form
                    cart = [];
                    updateCartDisplay();
                    orderForm.reset();
                    
                    // Hide checkout form after success
                    setTimeout(() => {
                        checkoutForm.classList.add('d-none');
                        orderSuccess.classList.add('d-none');
                    }, 5000);
                } else {
                    alert(data.error || 'Failed to place order. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
                alert('Network error. Please try again.');
            });
        });
    }
    
    // Payment method toggle
    const paymentCard = document.getElementById('paymentCard');
    const paymentCash = document.getElementById('paymentCash');
    const cardPaymentSection = document.getElementById('cardPaymentSection');
    
    if (paymentCard && paymentCash && cardPaymentSection) {
        paymentCard.addEventListener('change', function() {
            cardPaymentSection.style.display = 'block';
        });
        
        paymentCash.addEventListener('change', function() {
            cardPaymentSection.style.display = 'none';
        });
    }
    
    // Prescription form
    if (prescriptionForm) {
        prescriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const prescriptionFile = document.getElementById('prescriptionFile');
            if (!prescriptionFile.files.length) {
                alert('Please select a prescription file to upload');
                return;
            }
            
            // Simulate upload
            const submitButton = prescriptionForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...';
            submitButton.disabled = true;
            
            // Fake upload delay for demo
            setTimeout(() => {
                alert('Prescription uploaded successfully! Our pharmacist will review it shortly.');
                prescriptionForm.reset();
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }, 1500);
        });
    }
    
    // Initialize page
    displayMedicines('all');
    setupQuantityControls();
    
    // Functions
    
    // Function to search medicines
    function searchMedicines() {
        const searchTerm = medicineSearch.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            displayMedicines('all');
            return;
        }
        
        const filteredMedicines = medicines.filter(medicine => 
            medicine.name.toLowerCase().includes(searchTerm) || 
            medicine.description.toLowerCase().includes(searchTerm)
        );
        
        renderMedicineList(filteredMedicines);
    }
    
    // Function to display medicines by category
    function displayMedicines(category) {
        let filteredMedicines;
        
        if (category === 'all') {
            filteredMedicines = medicines;
        } else {
            filteredMedicines = medicines.filter(medicine => medicine.category === category);
        }
        
        renderMedicineList(filteredMedicines);
    }
    
    // Function to render medicine list
    function renderMedicineList(medicineList) {
        // Clear existing content
        if (!document.getElementById('medicineList')) return;
        document.getElementById('medicineList').innerHTML = '';
        
        if (medicineList.length === 0) {
            document.getElementById('medicineList').innerHTML = '<div class="col-12"><p class="text-center">No medicines found matching your criteria.</p></div>';
            return;
        }
        
        // Create medicine cards
        medicineList.forEach(medicine => {
            const card = document.createElement('div');
            card.className = 'col-md-6 mb-3';
            
            card.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">${medicine.name}</h5>
                        <p class="card-text">${medicine.description}</p>
                        <p class="fw-bold">$${medicine.price.toFixed(2)}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="input-group input-group-sm w-50">
                                <button class="btn btn-outline-secondary" type="button" data-action="decrease">-</button>
                                <input type="number" class="form-control text-center" value="1" min="1" max="10" data-medicine-id="${medicine.id}">
                                <button class="btn btn-outline-secondary" type="button" data-action="increase">+</button>
                            </div>
                            <button class="btn btn-primary btn-sm add-to-cart" data-medicine-id="${medicine.id}" data-medicine-name="${medicine.name}" data-medicine-price="${medicine.price}">
                                <i class="fas fa-cart-plus me-1"></i> Add
                            </button>
                        </div>
                        <div class="mt-2">
                            ${medicine.category === 'prescription' ? 
                                '<span class="badge bg-info">Prescription needed</span>' : 
                                '<span class="badge bg-success">Over-the-counter</span>'}
                            ${medicine.inStock ? 
                                '<span class="badge bg-light text-dark ms-1">In Stock</span>' : 
                                '<span class="badge bg-danger ms-1">Out of Stock</span>'}
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('medicineList').appendChild(card);
        });
        
        // Add event listeners to add-to-cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const medicineId = parseInt(this.dataset.medicineId);
                const medicineName = this.dataset.medicineName;
                const medicinePrice = parseFloat(this.dataset.medicinePrice);
                const quantityInput = document.querySelector(`input[data-medicine-id="${medicineId}"]`);
                const quantity = parseInt(quantityInput.value);
                
                addToCart(medicineId, medicineName, medicinePrice, quantity);
            });
        });
        
        // Setup quantity controls
        setupQuantityControls();
    }
    
    // Function to setup quantity control buttons
    function setupQuantityControls() {
        document.querySelectorAll('[data-action="decrease"], [data-action="increase"]').forEach(button => {
            button.addEventListener('click', function() {
                const action = this.dataset.action;
                const input = this.parentNode.querySelector('input');
                let value = parseInt(input.value);
                
                if (action === 'decrease') {
                    value = Math.max(1, value - 1);
                } else {
                    value = Math.min(10, value + 1);
                }
                
                input.value = value;
            });
        });
    }
    
    // Function to add item to cart
    function addToCart(medicineId, medicineName, medicinePrice, quantity) {
        // Check if item already in cart
        const existingItemIndex = cart.findIndex(item => item.id === medicineId);
        
        if (existingItemIndex !== -1) {
            // Update quantity if item already in cart
            cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            cart.push({
                id: medicineId,
                name: medicineName,
                price: medicinePrice,
                quantity: quantity
            });
        }
        
        // Update cart display
        updateCartDisplay();
        
        // Show notification
        showNotification(`Added ${quantity} ${medicineName} to cart`);
    }
    
    // Function to update cart display
    function updateCartDisplay() {
        if (!cartItems || !subtotalElement || !totalPriceElement) return;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="text-center text-muted my-4">Your cart is empty</p>';
            subtotalElement.textContent = '$0.00';
            totalPriceElement.textContent = '$' + deliveryFee.toFixed(2);
            checkoutBtn.disabled = true;
            return;
        }
        
        // Calculate subtotal
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const totalPrice = subtotal + deliveryFee;
        
        // Update price displays
        subtotalElement.textContent = '$' + subtotal.toFixed(2);
        totalPriceElement.textContent = '$' + totalPrice.toFixed(2);
        
        // Enable checkout button
        checkoutBtn.disabled = false;
        
        // Render cart items
        cartItems.innerHTML = '';
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom';
            
            itemElement.innerHTML = `
                <div>
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">$${item.price.toFixed(2)} x ${item.quantity}</small>
                </div>
                <div class="d-flex align-items-center">
                    <span class="fw-bold me-3">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItems.appendChild(itemElement);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                removeFromCart(index);
            });
        });
    }
    
    // Function to remove item from cart
    function removeFromCart(index) {
        if (index >= 0 && index < cart.length) {
            const removedItem = cart[index];
            cart.splice(index, 1);
            updateCartDisplay();
            showNotification(`Removed ${removedItem.name} from cart`);
        }
    }
    
    // Function to show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'toast align-items-center text-white bg-primary border-0 position-fixed bottom-0 end-0 m-3';
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        notification.setAttribute('aria-atomic', 'true');
        
        notification.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Initialize and show toast
        const toast = new bootstrap.Toast(notification, { autohide: true, delay: 3000 });
        toast.show();
        
        // Remove element after it's hidden
        notification.addEventListener('hidden.bs.toast', function() {
            notification.remove();
        });
    }
});
