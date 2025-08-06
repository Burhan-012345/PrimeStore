document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen initially
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Hide loading screen after 1.5 seconds (simulate loading)
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);

    // Initialize cart if it doesn't exist
    initializeCart();

    // User logo click handler
    const userLogo = document.getElementById('userLogo');
    if (userLogo) {
        userLogo.addEventListener('click', function() {
            sessionStorage.setItem('preLoginUrl', window.location.href);
            window.location.href = 'ulogin.html';
        });
    }

    // Cart icon click handler
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            handleCartClick();
        });
    }

    // Hamburger menu click handler
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            document.getElementById('mobileMenu').classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Update mobile menu with current user info
            updateMobileMenuUserInfo();
        });
    }

    // Close mobile menu handler
    const closeMenu = document.getElementById('closeMenu');
    if (closeMenu) {
        closeMenu.addEventListener('click', function() {
            document.getElementById('mobileMenu').classList.remove('show');
            document.body.style.overflow = 'auto';
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobileMenu');
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });

    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            handleAddToCart(this);
        });
    });

    // Initialize cart count
    updateCartCount();

    // Update mobile menu with user info if logged in
    updateMobileMenuUserInfo();

    // Cart management functions
    function initializeCart() {
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify({ items: [] }));
        }
    }

    function handleCartClick() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn) {
            window.location.href = 'cart.html';
        } else {
            sessionStorage.setItem('fromCartAction', 'true');
            sessionStorage.setItem('preLoginUrl', window.location.href);
            showLoginModal();
        }
    }

    function handleAddToCart(button) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (isLoggedIn) {
            const productCard = button.closest('.product-card');
            const product = {
                id: productCard.dataset.productId,
                name: productCard.dataset.productName,
                price: parseFloat(productCard.dataset.productPrice),
                image: productCard.querySelector('img').src,
                quantity: 1
            };
            
            addToCart(product);
            showNotification(`${product.name} added to cart!`, 'success');
        } else {
            sessionStorage.setItem('fromCartAction', 'true');
            sessionStorage.setItem('preLoginUrl', window.location.href);
            showLoginModal();
        }
    }

    function addToCart(product) {
        const cart = getCart();
        const existingItem = cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push(product);
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
            const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = count;
        }
    }

    // Update mobile menu with current user info
    function updateMobileMenuUserInfo() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const mobileUserInfo = document.querySelector('.mobile-user-info span');
        
        if (mobileUserInfo) {
            if (isLoggedIn) {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser) {
                    mobileUserInfo.textContent = currentUser.username;
                } else {
                    mobileUserInfo.textContent = 'User';
                }
            } else {
                mobileUserInfo.textContent = 'Guest';
            }
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

    function hideLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const loginModal = document.getElementById('loginModal');
        if (e.target === loginModal) {
            hideLoginModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideLoginModal();
        }
    });

    // Listen for cart updates from other tabs
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            updateCartCount();
        }
    });
});

// Login/Registration handlers (for ulogin.html)
function handleLogin() {
    localStorage.setItem('isLoggedIn', 'true');
    redirectAfterAuth();
}

function handleRegistration() {
    localStorage.setItem('isLoggedIn', 'true');
    redirectAfterAuth();
}

function redirectAfterAuth() {
    const fromCartAction = sessionStorage.getItem('fromCartAction') === 'true';
    const preLoginUrl = sessionStorage.getItem('preLoginUrl') || 'index.html';
    
    sessionStorage.removeItem('fromCartAction');
    sessionStorage.removeItem('preLoginUrl');
    
    window.location.href = fromCartAction ? 'cart.html' : preLoginUrl;
}