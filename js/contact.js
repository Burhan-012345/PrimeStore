document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const cartCountElement = document.querySelector('.cart-count');
    const userLogo = document.getElementById('userLogo');
    const cartIcon = document.querySelector('.cart-icon');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    const faqQuestions = document.querySelectorAll('.faq-question');

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

    // Show success modal
    function showSuccessModal() {
        successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Hide success modal
    function hideSuccessModal() {
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // FAQ functionality
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            this.classList.toggle('active');
            const answer = this.nextElementSibling;
            answer.classList.toggle('active');
        });
    });

    // Contact form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // In a real application, you would send the form data to a server here
        // For demo purposes, we'll just show a success message
        
        // Reset form
        this.reset();
        
        // Show success modal
        showSuccessModal();
    });

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
    closeSuccessModal.addEventListener('click', hideSuccessModal);

    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            hideLoginModal();
        }
        if (e.target === successModal) {
            hideSuccessModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (loginModal.style.display === 'flex') {
                hideLoginModal();
            }
            if (successModal.style.display === 'flex') {
                hideSuccessModal();
            }
        }
    });
});