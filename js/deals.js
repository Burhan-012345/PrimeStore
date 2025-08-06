document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const cartCountElement = document.querySelector('.cart-count');
    const userLogo = document.getElementById('userLogo');
    const cartIcon = document.querySelector('.cart-icon');
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    // Initialize cart count
    let cartCount = 0;
    if (localStorage.getItem('cart')) {
        try {
            const cart = JSON.parse(localStorage.getItem('cart'));
            cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        } catch (e) {
            console.error('Error parsing cart data:', e);
            localStorage.setItem('cart', JSON.stringify({ items: [] }));
        }
    }
    cartCountElement.textContent = cartCount;

    // Countdown timer for flash sale
    function updateCountdown() {
        const now = new Date();
        const endTime = new Date();
        endTime.setHours(23, 59, 59, 0); // Set to end of day
        
        const diff = endTime - now;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }

    // Update countdown every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Check if user is logged in
    function checkIfUserIsLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // Show login modal
    function showLoginModal() {
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Hide login modal
    function hideLoginModal() {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Add to cart function (Fixed)
    function addToCart(productId) {
        console.log('Adding to cart:', productId); // Debug log
        
        let cart = { items: [] };
        
        if (localStorage.getItem('cart')) {
            try {
                cart = JSON.parse(localStorage.getItem('cart'));
            } catch (e) {
                console.error('Error parsing cart:', e);
                cart = { items: [] };
            }
        }
        
        const productCard = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        if (!productCard) {
            console.error('Product card not found for ID:', productId);
            return;
        }
        
        const productName = productCard.querySelector('h3').textContent;
        const productPriceText = productCard.dataset.productPrice || productCard.querySelector('.price')?.textContent || '0';
        const productPrice = parseFloat(productPriceText.replace(/[^0-9.]/g, ''));
        const productImage = productCard.querySelector('img').src;
        
        console.log('Product details:', { productName, productPrice, productImage }); // Debug log
        
        const existingItem = cart.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({ 
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1 
            });
        }
        
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            console.log('Cart updated:', cart); // Debug log
        } catch (e) {
            console.error('Error saving cart:', e);
        }
        
        // Show success message
        alert(`${productName} has been added to your cart!`);
        
        updateCartCount();
    }

    // Update cart count
    function updateCartCount() {
        let cartCount = 0;
        if (localStorage.getItem('cart')) {
            try {
                const cart = JSON.parse(localStorage.getItem('cart'));
                cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
            } catch (e) {
                console.error('Error parsing cart:', e);
            }
        }
        cartCountElement.textContent = cartCount;
    }

    // Event listeners
    userLogo.addEventListener('click', function() {
        sessionStorage.setItem('preLoginUrl', window.location.href);
        window.location.href = 'ulogin.html';
    });

    cartIcon.addEventListener('click', function() {
        const isLoggedIn = checkIfUserIsLoggedIn();
        
        if (isLoggedIn) {
            window.location.href = 'cart.html';
        } else {
            sessionStorage.setItem('fromCartAction', 'true');
            sessionStorage.setItem('preLoginUrl', window.location.href);
            showLoginModal();
        }
    });

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const isLoggedIn = checkIfUserIsLoggedIn();
            
            if (isLoggedIn) {
                const productCard = this.closest('.product-card');
                if (!productCard) {
                    console.error('Product card not found');
                    return;
                }
                const productId = productCard.dataset.productId;
                if (!productId) {
                    console.error('Product ID not found');
                    return;
                }
                addToCart(productId);
            } else {
                sessionStorage.setItem('fromCartAction', 'true');
                sessionStorage.setItem('preLoginUrl', window.location.href);
                showLoginModal();
            }
        });
    });

    closeModal.addEventListener('click', hideLoginModal);

    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            hideLoginModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && loginModal.style.display === 'flex') {
            hideLoginModal();
        }
    });
});