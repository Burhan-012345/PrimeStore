// orders.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize orders if they don't exist
    initializeOrders();
    
    // Load orders
    loadOrders();
    
    // Update cart count in header
    updateCartCount();
    
    // Setup filter buttons
    setupFilterButtons();
    
    // Setup search functionality
    setupSearch();
    
    // Listen for new orders from payment page
    window.addEventListener('storage', function(e) {
        if (e.key === 'orders') {
            loadOrders();
        }
    });
});

function initializeOrders() {
    if (!localStorage.getItem('orders')) {
        // Sample orders for demo purposes
        const sampleOrders = [
            {
                id: 'PRIME-789012',
                date: '2023-06-15',
                status: 'delivered',
                items: [
                    {
                        id: 'prod-001',
                        name: 'Wireless Bluetooth Headphones',
                        price: 1999,
                        quantity: 1,
                        image: 'https://via.placeholder.com/100?text=Headphones'
                    }
                ],
                subtotal: 1999,
                shipping: 50,
                tax: 359.82,
                total: 2408.82,
                address: {
                    name: 'John Doe',
                    street: '123 Main Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zip: '400001',
                    phone: '+91 9876543210'
                },
                paymentMethod: 'credit_card'
            },
            {
                id: 'PRIME-345678',
                date: '2023-06-10',
                status: 'shipped',
                items: [
                    {
                        id: 'prod-002',
                        name: 'Smart Watch Pro',
                        price: 3499,
                        quantity: 1,
                        image: 'https://via.placeholder.com/100?text=Smart+Watch'
                    },
                    {
                        id: 'prod-003',
                        name: 'Phone Case',
                        price: 299,
                        quantity: 2,
                        image: 'https://via.placeholder.com/100?text=Phone+Case'
                    }
                ],
                subtotal: 4097,
                shipping: 0,
                tax: 737.46,
                total: 4834.46,
                address: {
                    name: 'John Doe',
                    street: '123 Main Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zip: '400001',
                    phone: '+91 9876543210'
                },
                paymentMethod: 'upi'
            }
        ];
        
        localStorage.setItem('orders', JSON.stringify(sampleOrders));
    }
}

function getOrders() {
    try {
        return JSON.parse(localStorage.getItem('orders')) || [];
    } catch (e) {
        console.error('Error parsing orders data:', e);
        return [];
    }
}

function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = count;
    }
}

function loadOrders(filter = 'all', searchQuery = '') {
    const orders = getOrders();
    const ordersListElement = document.getElementById('ordersList');
    
    // Clear existing orders
    ordersListElement.innerHTML = '';
    
    // Filter and search orders
    let filteredOrders = orders;
    
    if (filter !== 'all') {
        filteredOrders = orders.filter(order => order.status === filter);
    }
    
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter(order => 
            order.id.toLowerCase().includes(query)
        );
    }
    
    if (filteredOrders.length === 0) {
        ordersListElement.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-box-open"></i>
                <h3>No Orders Found</h3>
                <p>We couldn't find any orders matching your criteria.</p>
                <a href="products.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    // Render orders
    filteredOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        // Format date
        const formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        // Get status class
        let statusClass = '';
        switch(order.status) {
            case 'processing':
                statusClass = 'status-processing';
                break;
            case 'shipped':
                statusClass = 'status-shipped';
                break;
            case 'delivered':
                statusClass = 'status-delivered';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                break;
        }
        
        // Render order items
        let orderItemsHTML = '';
        order.items.forEach(item => {
            orderItemsHTML += `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}" class="order-item-img">
                    <div class="order-item-details">
                        <h4 class="order-item-title">${item.name}</h4>
                        <div class="order-item-price">₹${item.price.toFixed(2)}</div>
                        <div class="order-item-quantity">Quantity: ${item.quantity}</div>
                    </div>
                </div>
            `;
        });
        
        // Payment method icon
        let paymentIcon = '';
        switch(order.paymentMethod) {
            case 'credit_card':
                paymentIcon = '<i class="far fa-credit-card"></i>';
                break;
            case 'paypal':
                paymentIcon = '<i class="fab fa-paypal"></i>';
                break;
            case 'upi':
                paymentIcon = '<i class="fas fa-mobile-alt"></i>';
                break;
            case 'netbanking':
                paymentIcon = '<i class="fas fa-university"></i>';
                break;
        }
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-id">${order.id}</span>
                    <span class="order-date">Ordered on ${formattedDate}</span>
                </div>
                <span class="order-status ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>
            
            <div class="order-details">
                <div class="order-items">
                    ${orderItemsHTML}
                </div>
                
                <div class="order-summary">
                    <h4>Order Summary</h4>
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>₹${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span>₹${order.shipping.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax</span>
                        <span>₹${order.tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span>₹${order.total.toFixed(2)}</span>
                    </div>
                    
                    <div class="payment-method">
                        <p><strong>Payment Method:</strong> ${paymentIcon} ${order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn btn-primary track-order" data-order="${order.id}">Track Order</button>
                        <button class="btn btn-outline view-details" data-order="${order.id}">View Details</button>
                    </div>
                </div>
            </div>
            
            <div class="delivery-address">
                <h4>Delivery Address</h4>
                <p>${order.address.name}</p>
                <p>${order.address.street}</p>
                <p>${order.address.city}, ${order.address.state} ${order.address.zip}</p>
                <p>${order.address.phone}</p>
            </div>
        `;
        
        ordersListElement.appendChild(orderCard);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.track-order').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order');
            trackOrder(orderId);
        });
    });
    
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order');
            viewOrderDetails(orderId);
        });
    });
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Load orders with selected filter
            const filter = this.getAttribute('data-filter');
            loadOrders(filter);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('orderSearch');
    const searchButton = document.querySelector('.search-btn');
    
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        loadOrders('all', query);
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            loadOrders('all', query);
        }
    });
}

function trackOrder(orderId) {
    sessionStorage.setItem('trackOrderId', orderId);
    window.location.href = 'track.html';
}

function viewOrderDetails(orderId) {
    sessionStorage.setItem('viewOrderId', orderId);
    window.location.href = 'order-details.html';
}

// Update payment.js to add new orders
// Add this to the end of the processPayment function in payment.js
function addNewOrder(isSuccess, orderId, method) {
    if (isSuccess) {
        const cart = getCart();
        const orders = getOrders();
        
        const newOrder = {
            id: orderId,
            date: new Date().toISOString().split('T')[0],
            status: 'processing',
            items: [...cart.items],
            subtotal: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shipping: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 1000 ? 0 : 50,
            tax: cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.18,
            address: {
                name: 'John Doe',
                street: '123 Main Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                zip: '400001',
                phone: '+91 9876543210'
            },
            paymentMethod: method
        };
        
        newOrder.total = newOrder.subtotal + newOrder.shipping + newOrder.tax;
        
        orders.unshift(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}