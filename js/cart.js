document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if it doesn't exist
    initializeCart();
    
    // Load cart items
    loadCartItems();
    
    // Update cart count in header
    updateCartCount();
    
    // Proceed to payment button
    const proceedToPaymentBtn = document.getElementById('proceedToPayment');
    if (proceedToPaymentBtn) {
        proceedToPaymentBtn.addEventListener('click', function() {
            proceedToPayment();
        });
    }
    
    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            clearCart();
        });
    }
    
    // Listen for cart updates from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            loadCartItems();
            updateCartCount();
        }
    });
    
    // Initialize recently viewed items
    loadRecentlyViewed();
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

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
}

function loadCartItems() {
    const cart = getCart();
    const cartItemsList = document.getElementById('cartItemsList');
    const itemCountElement = document.getElementById('itemCount');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const proceedToPaymentBtn = document.getElementById('proceedToPayment');
    const clearCartBtn = document.getElementById('clearCartBtn');
    
    if (cart.items.length === 0) {
        cartItemsList.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="products.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        itemCountElement.textContent = '0 items';
        subtotalElement.textContent = '₹0.00';
        shippingElement.textContent = '₹0.00';
        taxElement.textContent = '₹0.00';
        totalElement.textContent = '₹0.00';
        if (proceedToPaymentBtn) {
            proceedToPaymentBtn.disabled = true;
        }
        if (clearCartBtn) {
            clearCartBtn.style.display = 'none';
        }
        return;
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over ₹1000
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + shipping + tax;
    
    // Update summary
    itemCountElement.textContent = `${cart.items.reduce((sum, item) => sum + item.quantity, 0)} ${cart.items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'}`;
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    shippingElement.textContent = `₹${shipping.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
    
    if (proceedToPaymentBtn) {
        proceedToPaymentBtn.disabled = false;
    }
    if (clearCartBtn) {
        clearCartBtn.style.display = 'block';
    }
    
    // Render cart items
    cartItemsList.innerHTML = '';
    cart.items.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.dataset.productId = item.id;
        cartItemElement.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/250x250?text=Product'}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <div class="cart-item-price">₹${parseFloat(item.price).toFixed(2)}</div>
                <div class="cart-item-actions">
                    <button class="cart-item-remove" data-product-id="${item.id}">
                        <i class="fas fa-trash-alt"></i> Remove
                    </button>
                </div>
            </div>
            <div class="cart-item-total">
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease-btn" data-product-id="${item.id}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
                    <button class="quantity-btn increase-btn" data-product-id="${item.id}">+</button>
                </div>
                <div class="cart-item-total-price">₹${(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
            </div>
        `;
        cartItemsList.appendChild(cartItemElement);
    });

    // Add event listeners to all remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId);
        });
    });

    // Add event listeners to all increase buttons
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            updateQuantity(productId, 'increase');
        });
    });

    // Add event listeners to all decrease buttons
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            updateQuantity(productId, 'decrease');
        });
    });

    // Add event listeners to all quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.getAttribute('data-product-id');
            const newQuantity = this.value;
            updateQuantityInput(productId, newQuantity);
        });
    });
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.setItem('cart', JSON.stringify({ items: [] }));
        loadCartItems();
        updateCartCount();
        showNotification('Cart cleared successfully', 'success');
    }
}

function updateQuantity(productId, action) {
    const cart = getCart();
    const itemIndex = cart.items.findIndex(item => item.id == productId); // Use == for loose comparison
    
    if (itemIndex === -1) return;
    
    if (action === 'increase') {
        cart.items[itemIndex].quantity += 1;
    } else if (action === 'decrease') {
        if (cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1;
        } else {
            // If quantity would go to 0, remove the item
            cart.items.splice(itemIndex, 1);
            showNotification('Item removed from cart', 'success');
        }
    }
    
    saveCart(cart);
    loadCartItems();
    updateCartCount();
    
    if (action === 'increase') {
        showNotification('Quantity increased', 'success');
    } else if (action === 'decrease' && cart.items[itemIndex]) {
        showNotification('Quantity decreased', 'success');
    }
}

function updateQuantityInput(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (isNaN(newQuantity)) return;
    
    const cart = getCart();
    const itemIndex = cart.items.findIndex(item => item.id == productId); // Use == for loose comparison
    
    if (itemIndex === -1) return;
    
    if (newQuantity < 1) {
        // Remove item if quantity is less than 1
        cart.items.splice(itemIndex, 1);
        showNotification('Item removed from cart', 'success');
    } else {
        cart.items[itemIndex].quantity = newQuantity;
        showNotification('Quantity updated', 'success');
    }
    
    saveCart(cart);
    loadCartItems();
    updateCartCount();
}

function removeFromCart(productId) {
    const cart = getCart();
    const itemIndex = cart.items.findIndex(item => item.id == productId); // Use == for loose comparison
    
    if (itemIndex === -1) return;
    
    cart.items.splice(itemIndex, 1);
    saveCart(cart);
    loadCartItems();
    updateCartCount();
    showNotification('Item removed from cart', 'success');
}

function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const cart = getCart();
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = count;
    }
}

function proceedToPayment() {
    const cart = getCart();
    
    if (cart.items.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Save cart to localStorage before proceeding to payment
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'payment.html';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.className = `notification ${type}`;
    notification.querySelector('#notification-message').textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function loadRecentlyViewed() {
    const recentlyViewed = document.getElementById('recentlyViewed');
    if (!recentlyViewed) return;
    
    const recentlyViewedItems = [
        {
            id: '5',
            name: 'Bluetooth Speaker',
            price: 1999,
            image: './assets/speaker.jpeg',
            rating: 4
        },
        {
            id: '6',
            name: 'Fitness Tracker',
            price: 2499,
            image: './assets/tracker.jpeg',
            rating: 4.5
        },
        {
            id: '7',
            name: 'Wireless Earbuds',
            price: 2999,
            image: './assets/earbuds.jpeg',
            rating: 4
        },
        {
            id: '8',
            name: 'Power Bank',
            price: 999,
            image: './assets/powerbank.jpeg',
            rating: 3.5
        }
    ];
    
    recentlyViewed.innerHTML = '';
    recentlyViewedItems.forEach(item => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.productId = item.id;
        productCard.dataset.productName = item.name;
        productCard.dataset.productPrice = item.price;
        productCard.dataset.productImage = item.image;
        productCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <div class="price">₹${item.price.toFixed(2)}</div>
            <div class="rating">
                ${renderRatingStars(item.rating)}
                <span>(${Math.floor(Math.random() * 100) + 50})</span>
            </div>
            <button class="btn btn-add-to-cart" data-product-id="${item.id}">Add to Cart</button>
        `;
        recentlyViewed.appendChild(productCard);
    });

    // Add event listeners to recently viewed add to cart buttons
    document.querySelectorAll('#recentlyViewed .btn-add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            addToCartFromRecentlyViewed(productId);
        });
    });
}

function renderRatingStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function addToCartFromRecentlyViewed(productId) {
    const recentlyViewedItems = [
        {
            id: '5',
            name: 'Bluetooth Speaker',
            price: 1999,
            image: './assets/speaker.jpeg'
        },
        {
            id: '6',
            name: 'Fitness Tracker',
            price: 2499,
            image: './assets/tracker.jpeg'
        },
        {
            id: '7',
            name: 'Wireless Earbuds',
            price: 2999,
            image: './assets/earbuds.jpeg'
        },
        {
            id: '8',
            name: 'Power Bank',
            price: 999,
            image: './assets/powerbank.jpeg'
        }
    ];
    
    const product = recentlyViewedItems.find(item => item.id === productId);
    if (!product) return;
    
    const cart = getCart();
    const existingItem = cart.items.find(item => item.id == product.id); // Use == for loose comparison
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart(cart);
    loadCartItems();
    updateCartCount();
    showNotification(`${product.name} added to cart!`, 'success');
}