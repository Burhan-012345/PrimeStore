document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if it doesn't exist
    initializeCart();

    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleAddToCart(this);
        });
    });

    // Update cart count
    updateCartCount();

    // Handle "Buy 2 Get 1 Free" offers
    function handleAddToCart(button) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn) {
            const productCard = button.closest('.product-card');
            const product = {
                id: productCard.dataset.productId,
                name: productCard.dataset.productName,
                price: parseFloat(productCard.dataset.productPrice),
                image: productCard.querySelector('img').src,
                quantity: 1,
                hasOffer: productCard.querySelector('.offer-badge') !== null
            };
            
            addToCart(product);
            showNotification(`${product.name} added to cart!`, 'success');
            
            // Check if we need to add free product for offers
            if (product.hasOffer) {
                checkForFreeProductOffer(product.id);
            }
        } else {
            sessionStorage.setItem('fromCartAction', 'true');
            sessionStorage.setItem('preLoginUrl', window.location.href);
            showLoginModal();
        }
    }

    // Check if user qualifies for free product offer
    function checkForFreeProductOffer(productId) {
        const cart = getCart();
        const productInCart = cart.items.find(item => item.id === productId);
        
        if (productInCart && productInCart.quantity >= 2) {
            // Check if free product already added
            const freeProductExists = cart.items.some(item => 
                item.id === `free-${productId}` && item.price === 0);
            
            if (!freeProductExists) {
                const freeProduct = {
                    id: `free-${productId}`,
                    name: `FREE: ${productInCart.name}`,
                    price: 0,
                    image: productInCart.image,
                    quantity: 1,
                    isFreeProduct: true
                };
                
                addToCart(freeProduct);
                showNotification(`You got a free ${productInCart.name}!`, 'success');
            }
        }
    }

    // Cart management functions
    function initializeCart() {
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify({ items: [] }));
        }
    }

    function addToCart(product) {
        const cart = getCart();
        
        // For regular products (not free ones)
        if (!product.isFreeProduct) {
            const existingItem = cart.items.find(item => 
                item.id === product.id && !item.isFreeProduct);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.items.push(product);
            }
        } 
        // For free products
        else {
            const existingFreeItem = cart.items.find(item => 
                item.id === product.id && item.isFreeProduct);
            
            if (!existingFreeItem) {
                cart.items.push(product);
            }
        }
        
        saveCart(cart);
        updateCartCount();
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

    function updateCartCount() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const cart = getCart();
            // Don't count free products in the cart count
            const count = cart.items.reduce((sum, item) => 
                sum + (item.isFreeProduct ? 0 : item.quantity), 0);
            cartCountElement.textContent = count;
        }
    }

    // Notification system
    function showNotification(message, type = 'success') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            notification.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span id="notification-message"></span>
            `;
            document.body.appendChild(notification);
        }
        
        // Set icon based on notification type
        let iconClass = 'fa-check-circle';
        if (type === 'error') iconClass = 'fa-exclamation-circle';
        if (type === 'warning') iconClass = 'fa-exclamation-triangle';
        
        notification.querySelector('i').className = `fas ${iconClass}`;
        notification.className = `notification ${type}`;
        notification.querySelector('#notification-message').textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Login modal functions
    function showLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            // Fallback if modal doesn't exist - redirect to login page
            sessionStorage.setItem('preLoginUrl', window.location.href);
            window.location.href = 'ulogin.html';
        }
    }
});