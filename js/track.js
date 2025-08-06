document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count
    updateCartCount();
    
    // Load order details from session storage
    const orderId = sessionStorage.getItem('trackOrderId') || 'PRIME-123456';
    document.getElementById('order-id').value = orderId;
    document.getElementById('display-order-id').textContent = orderId;
    
    // Form submission
    const trackOrderForm = document.getElementById('trackOrderForm');
    if (trackOrderForm) {
        trackOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const orderId = document.getElementById('order-id').value.trim();
            if (orderId) {
                trackOrder(orderId);
            }
        });
    }
    
    // Cancel order button
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', function() {
            showCancelModal();
        });
    }
    
    // Modal buttons
    setupModalButtons();
    
    // Listen for cart updates from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            updateCartCount();
        }
    });
});

function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = count;
    }
}

function trackOrder(orderId) {
    // In a real application, this would make an API call to fetch order details
    // For demo purposes, we'll just update the displayed order ID
    document.getElementById('display-order-id').textContent = orderId;
    sessionStorage.setItem('trackOrderId', orderId);
    
    // Show the order details section
    document.getElementById('orderDetails').style.display = 'block';
}

function showCancelModal() {
    const modal = document.getElementById('cancelOrderModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideCancelModal() {
    const modal = document.getElementById('cancelOrderModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function setupModalButtons() {
    // Cancel Order Modal
    const cancelOrderModal = document.getElementById('cancelOrderModal');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const cancelCancelBtn = document.getElementById('cancelCancelBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', function() {
            cancelOrder();
        });
    }
    
    if (cancelCancelBtn) {
        cancelCancelBtn.addEventListener('click', function() {
            hideCancelModal();
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            hideCancelModal();
        });
    }
    
    // Success Modal
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            window.location.href = 'products.html';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === cancelOrderModal) {
            hideCancelModal();
        }
        
        const successModal = document.getElementById('successModal');
        if (e.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideCancelModal();
            
            const successModal = document.getElementById('successModal');
            if (successModal.style.display === 'flex') {
                successModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });
}

function cancelOrder() {
    // In a real application, this would make an API call to cancel the order
    const reason = document.getElementById('cancel-reason').value;
    console.log('Cancellation reason:', reason);
    
    // Simulate API call delay
    setTimeout(function() {
        hideCancelModal();
        showSuccessModal();
        
        // Update the order status in the UI
        const statusBadge = document.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.classList.remove('shipped');
            statusBadge.classList.add('cancelled');
            statusBadge.textContent = 'Cancelled';
        }
        
        // Disable the cancel button
        const cancelOrderBtn = document.getElementById('cancelOrderBtn');
        if (cancelOrderBtn) {
            cancelOrderBtn.disabled = true;
        }
        
        // Update timeline
        updateTimelineForCancellation();
    }, 1500);
}

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function updateTimelineForCancellation() {
    const timelineSteps = document.querySelectorAll('.timeline-step');
    const progressBar = document.querySelector('.progress-bar');
    
    if (timelineSteps && progressBar) {
        // Mark all steps as incomplete except the first one
        timelineSteps.forEach((step, index) => {
            if (index > 0) {
                step.classList.remove('completed', 'active');
                step.querySelector('.step-icon').className = 'step-icon';
                step.querySelector('.step-icon').innerHTML = '<i class="fas fa-times"></i>';
                step.querySelector('.step-icon').style.backgroundColor = '#f8d7da';
                step.querySelector('.step-icon').style.color = '#721c24';
            }
        });
        
        // Update progress bar
        progressBar.style.width = '25%';
        progressBar.style.backgroundColor = '#f8d7da';
    }
}