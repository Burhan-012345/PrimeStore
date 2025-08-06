document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const cartCountElement = document.querySelector('.cart-count');
    const userLogo = document.getElementById('userLogo');
    const cartIcon = document.querySelector('.cart-icon');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');

    // Initialize cart count
    let cartCount = 0;
    if (localStorage.getItem('cart')) {
        const cart = JSON.parse(localStorage.getItem('cart'));
        cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    }
    cartCountElement.textContent = cartCount;

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