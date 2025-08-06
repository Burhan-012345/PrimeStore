document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if it doesn't exist
    initializeCart();
    
    // Load order summary
    loadOrderSummary();
    
    // Update cart count in header
    updateCartCount();
    
    // Payment tabs functionality
    setupPaymentTabs();
    
    // Form submissions
    setupFormSubmissions();
    
    // Modal buttons
    setupModalButtons();
    
    // Listen for cart updates from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            updateCartCount();
        }
    });
});

function initializeCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify({ items: [] }));
    }
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem('cart')) || { items: [] };
    } catch (e) {
        console.error('Error parsing cart data:', e);
        return { items: [] };
    }
}

function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const cart = getCart();
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = count;
    }
}

function loadOrderSummary() {
    const cart = getCart();
    const orderItemsElement = document.getElementById('orderItems');
    const subtotalElement = document.getElementById('order-subtotal');
    const shippingElement = document.getElementById('order-shipping');
    const taxElement = document.getElementById('order-tax');
    const totalElement = document.getElementById('order-total');
    const deliveryAddressElement = document.getElementById('deliveryAddress');
    
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over ₹1000
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + shipping + tax;
    
    // Update summary
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    shippingElement.textContent = `₹${shipping.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
    
    // Render order items
    orderItemsElement.innerHTML = '';
    if (cart.items.length === 0) {
        orderItemsElement.innerHTML = '<p>No items in cart</p>';
        return;
    }
    
    cart.items.forEach(item => {
        const orderItemElement = document.createElement('div');
        orderItemElement.className = 'order-item';
        orderItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="order-item-img">
            <div class="order-item-details">
                <h4 class="order-item-title">${item.name}</h4>
                <div class="order-item-price">₹${item.price.toFixed(2)}</div>
                <div class="order-item-quantity">Quantity: ${item.quantity}</div>
            </div>
        `;
        orderItemsElement.appendChild(orderItemElement);
    });
    
    // Load default delivery address
    const defaultAddress = {
        name: 'John Doe',
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001',
        phone: '+91 9876543210'
    };
    
    deliveryAddressElement.innerHTML = `
        <p><strong>${defaultAddress.name}</strong></p>
        <p>${defaultAddress.street}</p>
        <p>${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.zip}</p>
        <p>${defaultAddress.phone}</p>
    `;
}

function setupPaymentTabs() {
    const tabs = document.querySelectorAll('.payment-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function setupFormSubmissions() {
    // Credit Card Form
    const creditCardForm = document.getElementById('creditCardForm');
    if (creditCardForm) {
        creditCardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment('credit_card');
        });
    }
    
    // PayPal Button
    const paypalButton = document.getElementById('paypal-button');
    if (paypalButton) {
        paypalButton.addEventListener('click', function(e) {
            e.preventDefault();
            processPayment('paypal');
        });
    }
    
    // UPI Form
    const upiForm = document.getElementById('upiForm');
    if (upiForm) {
        upiForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment('upi');
        });
    }
    
    // Net Banking Form
    const netbankingForm = document.getElementById('netbankingForm');
    if (netbankingForm) {
        netbankingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment('netbanking');
        });
    }
}

function processPayment(method) {
    // Simulate payment processing
    showLoading(true);
    
    // Randomly determine success or failure (80% success rate for demo)
    const isSuccess = Math.random() < 0.8;
    
    setTimeout(() => {
        showLoading(false);
        showPaymentResult(isSuccess, method);
    }, 2000);
}

function showLoading(show) {
    const payButtons = document.querySelectorAll('.btn-pay-now, #paypal-button');
    
    if (show) {
        payButtons.forEach(button => {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        });
    } else {
        payButtons.forEach(button => {
            button.disabled = false;
            if (button.id === 'paypal-button') {
                button.innerHTML = '<i class="fab fa-paypal"></i> Continue with PayPal';
            } else {
                button.textContent = button.getAttribute('data-original-text') || 'Pay Now';
            }
        });
    }
}

function showPaymentResult(success, method) {
    const modal = document.getElementById('paymentModal');
    const successModal = document.getElementById('successModal');
    const errorModal = document.getElementById('errorModal');
    
    if (success) {
        successModal.style.display = 'block';
        errorModal.style.display = 'none';
        
        // Generate random order ID
        const orderId = 'PRIME-' + Math.floor(100000 + Math.random() * 900000);
        document.getElementById('orderId').textContent = orderId;
        
        // Clear cart on successful payment
        localStorage.setItem('cart', JSON.stringify({ items: [] }));
        updateCartCount();
    } else {
        successModal.style.display = 'none';
        errorModal.style.display = 'block';
        
        // Set appropriate error message based on payment method
        let errorMessage = 'There was an issue processing your payment. Please try again.';
        
        if (method === 'credit_card') {
            errorMessage = 'Your card was declined. Please try another card or payment method.';
        } else if (method === 'paypal') {
            errorMessage = 'We couldn\'t connect to PayPal. Please try again or use another payment method.';
        } else if (method === 'upi') {
            errorMessage = 'UPI transaction failed. Please check your UPI ID and try again.';
        } else if (method === 'netbanking') {
            errorMessage = 'Bank transaction failed. Please try again or use another payment method.';
        }
        
        document.getElementById('errorMessage').textContent = errorMessage;
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function setupModalButtons() {
    const modal = document.getElementById('paymentModal');
    
    // Track Order Button
    const trackOrderBtn = document.getElementById('trackOrderBtn');
    if (trackOrderBtn) {
        trackOrderBtn.addEventListener('click', function() {
            const orderId = document.getElementById('orderId').textContent;
            sessionStorage.setItem('trackOrderId', orderId);
            window.location.href = 'track.html';
        });
    }
    
    // Continue Shopping Button
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = 'products.html';
        });
    }
    
    // Try Again Button
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    if (tryAgainBtn) {
        tryAgainBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Change Method Button
    const changeMethodBtn = document.getElementById('changeMethodBtn');
    if (changeMethodBtn) {
        changeMethodBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Switch to credit card tab
            const creditCardTab = document.querySelector('.payment-tab[data-tab="credit-card"]');
            if (creditCardTab) {
                creditCardTab.click();
            }
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}