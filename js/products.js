document.addEventListener('DOMContentLoaded', function() {
    // Sample product data
    const products = [
        {
            id: 1,
            name: "Premium Smartphone",
            price: 1800,
            image: "./assets/galaxy.jpeg",
            category: "electronics",
            rating: 4.5,
            reviews: 128
        },
        {
            id: 2,
            name: "Wireless Headphones",
            price: 17.5,
            image: "./assets/headphone.jpeg",
            category: "electronics",
            rating: 4,
            reviews: 87
        },
        {
            id: 3,
            name: "Smart Watch",
            price: 60.00,
            image: "./assets/watch.jpeg",
            category: "electronics",
            rating: 5,
            reviews: 215
        },
        {
            id: 4,
            name: "Ultra Slim Laptop",
            price: 1000.00,
            image: "./assets/laptop.jpeg",
            category: "electronics",
            rating: 4.5,
            reviews: 156
        },
        {
            id: 5,
            name: "Men's Casual Shirt",
            price: 6.00,
            image: "./assets/shirt.jpeg",
            category: "fashion",
            rating: 4,
            reviews: 72
        },
        {
            id: 6,
            name: "Women's Summer Dress",
            price: 7.00,
            image: "./assets/dress.jpeg",
            category: "fashion",
            rating: 4.5,
            reviews: 143
        },
        {
            id: 7,
            name: "Modern Coffee Table",
            price: 125.00,
            image: "./assets/ctable.jpeg",
            category: "home",
            rating: 4,
            reviews: 68
        },
        {
            id: 8,
            name: "Indoor Plant Set",
            price: 60.00,
            image: "./assets/plant.jpeg",
            category: "home",
            rating: 4.5,
            reviews: 91
        }
    ];

    // DOM elements
    const productsGrid = document.querySelector('.products-grid');
    const categoryFilter = document.getElementById('category');
    const sortFilter = document.getElementById('sort');
    const filterBtn = document.querySelector('.btn-filter');
    const cartCountElement = document.querySelector('.cart-count');
    const userLogo = document.getElementById('userLogo');
    const cartIcon = document.querySelector('.cart-icon');
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');

    // Initialize cart count
    let cartCount = 0;
    if (localStorage.getItem('cart')) {
        const cart = JSON.parse(localStorage.getItem('cart'));
        cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
    }
    cartCountElement.textContent = cartCount;

    // Render products
    function renderProducts(productsToRender) {
        productsGrid.innerHTML = '';
        
        productsToRender.forEach(product => {
            const ratingStars = renderRatingStars(product.rating);
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.dataset.productId = product.id;
            productCard.dataset.productName = product.name;
            productCard.dataset.productPrice = product.price;
            productCard.dataset.productImage = product.image;
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="price">$${product.price.toFixed(2)}</div>
                    <div class="rating">
                        ${ratingStars}
                        <span>(${product.reviews})</span>
                    </div>
                    <button class="btn btn-add-to-cart">Add to Cart</button>
                </div>
            `;
            
            productsGrid.appendChild(productCard);
        });

        // Add event listeners to new Add to Cart buttons
        document.querySelectorAll('.btn-add-to-cart').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const isLoggedIn = checkIfUserIsLoggedIn();
                
                if (isLoggedIn) {
                    const productCard = this.closest('.product-card');
                    const product = {
                        id: parseInt(productCard.dataset.productId),
                        name: productCard.dataset.productName,
                        price: parseFloat(productCard.dataset.productPrice),
                        image: productCard.querySelector('img').src,
                        quantity: 1
                    };
                    addToCart(product);
                    showNotification(`${product.name} added to cart!`, 'success');
                    updateCartCount();
                } else {
                    sessionStorage.setItem('fromCartAction', 'true');
                    sessionStorage.setItem('preLoginUrl', window.location.href);
                    showLoginModal();
                }
            });
        });
    }

    // Render rating stars
    function renderRatingStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }

    // Filter and sort products
    function filterAndSortProducts() {
        const category = categoryFilter.value;
        const sortBy = sortFilter.value;
        
        let filteredProducts = [...products];
        
        // Filter by category
        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }
        
        // Sort products
        switch (sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // Default is 'popular' which we'll consider as most reviews
                filteredProducts.sort((a, b) => b.reviews - a.reviews);
        }
        
        renderProducts(filteredProducts);
    }

    // Add to cart function
    function addToCart(product) {
        let cart = { items: [] };
        
        if (localStorage.getItem('cart')) {
            cart = JSON.parse(localStorage.getItem('cart'));
        }
        
        const existingItem = cart.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push(product);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Update cart count
    function updateCartCount() {
        if (localStorage.getItem('cart')) {
            const cart = JSON.parse(localStorage.getItem('cart'));
            cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        } else {
            cartCount = 0;
        }
        cartCountElement.textContent = cartCount;
    }

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

    // Show notification
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Event listeners
    filterBtn.addEventListener('click', filterAndSortProducts);
    
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

    // Initial render
    filterAndSortProducts();
});
