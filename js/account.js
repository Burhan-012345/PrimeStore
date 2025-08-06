document.addEventListener('DOMContentLoaded', function() {
    // Enhanced login check with proper redirection
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop();
    
    // If not logged in and not on login page, redirect to login
    if (!isLoggedIn && currentPage !== 'ulogin.html') {
        window.location.href = 'ulogin.html';
        return;
    }
    
    // If logged in and on login page, redirect to account
    if (isLoggedIn && currentPage === 'ulogin.html') {
        window.location.href = 'account.html';
        return;
    }

    // Initialize user data if it doesn't exist
    initializeUserData();

    // Load user data
    loadUserData();

    // Tab switching functionality - Fixed version
    function setupTabSwitching() {
        const tabLinks = document.querySelectorAll('.account-menu a');
        const tabContents = document.querySelectorAll('.account-tab');
        
        // Set default tab if none is active
        if (document.querySelector('.account-menu a.active') === null && tabLinks.length > 0) {
            tabLinks[0].classList.add('active');
            const defaultTabId = tabLinks[0].getAttribute('data-tab') + '-tab';
            document.getElementById(defaultTabId).classList.add('active');
        }
        
        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links and tabs
                tabLinks.forEach(l => l.classList.remove('active'));
                tabContents.forEach(tab => tab.classList.remove('active'));
                
                // Add active class to clicked link and corresponding tab
                this.classList.add('active');
                const tabId = this.getAttribute('data-tab') + '-tab';
                document.getElementById(tabId).classList.add('active');
                
                // Load specific content if needed when tab changes
                const tabName = this.getAttribute('data-tab');
                if (tabName === 'orders') {
                    loadOrders();
                } else if (tabName === 'addresses') {
                    loadAddresses();
                } else if (tabName === 'wishlist') {
                    loadWishlist();
                }
            });
        });
    }

    // Initialize tab switching
    setupTabSwitching();

    // Address Modal
    const addressModal = document.getElementById('addressModal');
    const addAddressBtn = document.getElementById('addAddressBtn');
    const addressForm = document.getElementById('addressForm');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            document.getElementById('addressModalTitle').textContent = 'Add New Address';
            document.getElementById('addressId').value = '';
            addressForm.reset();
            addressModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            addressModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target === addressModal) {
            addressModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Address Form Submission
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const addressId = document.getElementById('addressId').value;
            const addressData = {
                id: addressId || Date.now().toString(),
                type: document.getElementById('addressType').value,
                fullName: document.getElementById('addressFullName').value,
                phone: document.getElementById('addressPhone').value,
                line1: document.getElementById('addressLine1').value,
                line2: document.getElementById('addressLine2').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zipCode: document.getElementById('zipCode').value,
                country: document.getElementById('country').value,
                isDefault: document.getElementById('defaultAddress').checked
            };
            
            saveAddress(addressData);
            addressModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            loadAddresses();
        });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('currentUser');
            window.location.href = 'ulogin.html';
        });
    }

    // Account Settings Form
    const accountSettingsForm = document.getElementById('accountSettingsForm');
    if (accountSettingsForm) {
        accountSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users'));
            const userIndex = users.findIndex(u => u.userId === currentUser.userId);
            
            const userData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value
            };
            
            // Password change logic
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword && newPassword !== confirmPassword) {
                showNotification('New passwords do not match', 'error');
                return;
            }
            
            if (newPassword) {
                if (currentPassword !== currentUser.password) {
                    showNotification('Current password is incorrect', 'error');
                    return;
                }
                users[userIndex].password = newPassword;
                currentUser.password = newPassword;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update user data in both currentUser and users array
            users[userIndex].email = userData.email;
            currentUser.email = userData.email;
            currentUser.fullName = userData.fullName;
            currentUser.phone = userData.phone;
            
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('userData', JSON.stringify(userData));
            
            loadUserData();
            showNotification('Account settings updated successfully', 'success');
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        });
    }

    // Functions
    function initializeUserData() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        if (!localStorage.getItem('userData')) {
            const defaultUser = {
                fullName: currentUser.username || 'User',
                email: currentUser.email || '',
                phone: '+1 234 567 890',
                password: currentUser.password || '',
                addresses: [],
                orders: [],
                wishlist: []
            };
            
            // Add some sample data
            defaultUser.addresses = [
                {
                    id: '1',
                    type: 'home',
                    fullName: defaultUser.fullName,
                    phone: defaultUser.phone,
                    line1: '123 Main Street',
                    line2: 'Apt 4B',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'USA',
                    isDefault: true
                }
            ];
            
            defaultUser.orders = [
                {
                    id: 'ORD-1001',
                    date: '2023-06-15',
                    status: 'completed',
                    total: 2499.00,
                    products: [
                        { id: '2', name: 'Wireless Headphones', price: 1499.00, quantity: 1, image: 'assets/headphone.png' },
                        { id: '5', name: 'Phone Case', price: 500.00, quantity: 2, image: 'assets/case.png' }
                    ]
                },
                {
                    id: 'ORD-1002',
                    date: '2023-07-22',
                    status: 'processing',
                    total: 20000.00,
                    products: [
                        { id: '1', name: 'Premium Smartphone', price: 20000.00, quantity: 1, image: 'assets/phone.png' }
                    ]
                }
            ];
            
            defaultUser.wishlist = [
                { id: '3', name: 'Smart Watch', price: 5000.00, image: 'assets/watch.png' },
                { id: '4', name: 'Ultra Slim Laptop', price: 70000.00, image: 'assets/laptop.png' },
                { id: '6', name: 'Bluetooth Speaker', price: 2500.00, image: 'assets/speaker.png' }
            ];
            
            localStorage.setItem('userData', JSON.stringify(defaultUser));
        }
        
        // Ensure isLoggedIn is set if user data exists
        if (localStorage.getItem('userData') && !localStorage.getItem('isLoggedIn')) {
            localStorage.setItem('isLoggedIn', 'true');
        }
    }

    function loadUserData() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if (!currentUser || !userData) {
            window.location.href = 'ulogin.html';
            return;
        }
        
        // Update profile info
        document.getElementById('userName').textContent = userData.fullName || currentUser.username;
        document.getElementById('userEmail').textContent = userData.email || currentUser.email;
        
        // Update dashboard counts
        document.getElementById('totalOrders').textContent = userData.orders.length;
        document.getElementById('wishlistCount').textContent = userData.wishlist.length;
        document.getElementById('addressCount').textContent = userData.addresses.length;
        
        // Update recent orders
        loadRecentOrders();
        
        // Update orders list
        loadOrders();
        
        // Update addresses
        loadAddresses();
        
        // Update wishlist
        loadWishlist();
        
        // Update account settings form
        if (document.getElementById('fullName')) {
            document.getElementById('fullName').value = userData.fullName || currentUser.username;
            document.getElementById('email').value = userData.email || currentUser.email;
            document.getElementById('phone').value = userData.phone || '';
        }
        
        // Re-setup tab switching after content loads
        setupTabSwitching();
    }

    function loadRecentOrders() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const recentOrdersContainer = document.getElementById('recentOrders');
        
        if (!recentOrdersContainer) return;
        
        recentOrdersContainer.innerHTML = '';
        
        // Show only the 3 most recent orders
        const recentOrders = userData.orders.slice(0, 3);
        
        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${formatDate(order.date)}</td>
                <td><span class="order-status ${order.status}">${order.status}</span></td>
                <td>₹${order.total.toFixed(2)}</td>
                <td><a href="#" class="btn btn-secondary btn-sm" data-order-id="${order.id}">View</a></td>
            `;
            
            recentOrdersContainer.appendChild(row);
        });
    }

    function loadOrders() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const ordersListContainer = document.getElementById('ordersList');
        
        if (!ordersListContainer) return;
        
        ordersListContainer.innerHTML = '';
        
        userData.orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            
            let productsHTML = '';
            order.products.forEach(product => {
                productsHTML += `
                    <div class="order-product">
                        <img src="${product.image}" alt="${product.name}">
                        <p>${product.name}</p>
                    </div>
                `;
            });
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <div>
                        <h3>Order #${order.id}</h3>
                        <p>Placed on ${formatDate(order.date)}</p>
                    </div>
                    <span class="order-status ${order.status}">${order.status}</span>
                </div>
                <div class="order-products">
                    ${productsHTML}
                </div>
                <div class="order-footer">
                    <div>
                        <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
                    </div>
                    <div>
                        <a href="#" class="btn btn-secondary">View Details</a>
                    </div>
                </div>
            `;
            
            ordersListContainer.appendChild(orderCard);
        });
    }

    function loadAddresses() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const addressesGrid = document.getElementById('addressesGrid');
        
        if (!addressesGrid) return;
        
        addressesGrid.innerHTML = '';
        
        userData.addresses.forEach(address => {
            const addressCard = document.createElement('div');
            addressCard.className = `address-card ${address.isDefault ? 'default' : ''}`;
            
            addressCard.innerHTML = `
                <span class="address-type">${address.type}</span>
                <h3>${address.fullName}</h3>
                <p>${address.line1}</p>
                ${address.line2 ? `<p>${address.line2}</p>` : ''}
                <p>${address.city}, ${address.state} ${address.zipCode}</p>
                <p>${address.country}</p>
                <p><strong>Phone:</strong> ${address.phone}</p>
                ${address.isDefault ? '<p class="default-badge"><strong>Default Address</strong></p>' : ''}
                <div class="address-actions">
                    <button class="btn btn-secondary edit-address" data-address-id="${address.id}">Edit</button>
                    ${!address.isDefault ? `<button class="btn btn-primary set-default" data-address-id="${address.id}">Set Default</button>` : ''}
                    ${!address.isDefault ? `<button class="btn btn-danger delete-address" data-address-id="${address.id}">Delete</button>` : ''}
                </div>
            `;
            
            addressesGrid.appendChild(addressCard);
        });
        
        // Add event listeners for address actions
        document.querySelectorAll('.edit-address').forEach(button => {
            button.addEventListener('click', function() {
                const addressId = this.getAttribute('data-address-id');
                editAddress(addressId);
            });
        });
        
        document.querySelectorAll('.set-default').forEach(button => {
            button.addEventListener('click', function() {
                const addressId = this.getAttribute('data-address-id');
                setDefaultAddress(addressId);
            });
        });
        
        document.querySelectorAll('.delete-address').forEach(button => {
            button.addEventListener('click', function() {
                const addressId = this.getAttribute('data-address-id');
                deleteAddress(addressId);
            });
        });
    }

    function loadWishlist() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const wishlistGrid = document.getElementById('wishlistGrid');
        
        if (!wishlistGrid) return;
        
        wishlistGrid.innerHTML = '';
        
        userData.wishlist.forEach(item => {
            const wishlistItem = document.createElement('div');
            wishlistItem.className = 'wishlist-item';
            
            wishlistItem.innerHTML = `
                <div class="remove-wishlist" data-product-id="${item.id}">
                    <i class="fas fa-times"></i>
                </div>
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <div class="wishlist-price">₹${item.price.toFixed(2)}</div>
                <div class="wishlist-actions">
                    <button class="btn btn-primary add-to-cart" data-product-id="${item.id}">Add to Cart</button>
                    <button class="btn btn-secondary view-product" data-product-id="${item.id}">View</button>
                </div>
            `;
            
            wishlistGrid.appendChild(wishlistItem);
        });
        
        // Add event listeners for wishlist actions
        document.querySelectorAll('.remove-wishlist').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                removeFromWishlist(productId);
            });
        });
        
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id');
                addWishlistItemToCart(productId);
            });
        });
    }

    function saveAddress(addressData) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        if (addressData.isDefault) {
            // Remove default status from all other addresses
            userData.addresses.forEach(address => {
                address.isDefault = false;
            });
        }
        
        const existingIndex = userData.addresses.findIndex(a => a.id === addressData.id);
        if (existingIndex >= 0) {
            // Update existing address
            userData.addresses[existingIndex] = addressData;
        } else {
            // Add new address
            userData.addresses.push(addressData);
            
            // If this is the first address, set it as default
            if (userData.addresses.length === 1) {
                addressData.isDefault = true;
            }
        }
        
        localStorage.setItem('userData', JSON.stringify(userData));
        showNotification('Address saved successfully', 'success');
    }

    function editAddress(addressId) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const address = userData.addresses.find(a => a.id === addressId);
        
        if (address) {
            document.getElementById('addressModalTitle').textContent = 'Edit Address';
            document.getElementById('addressId').value = address.id;
            document.getElementById('addressType').value = address.type;
            document.getElementById('addressFullName').value = address.fullName;
            document.getElementById('addressPhone').value = address.phone;
            document.getElementById('addressLine1').value = address.line1;
            document.getElementById('addressLine2').value = address.line2 || '';
            document.getElementById('city').value = address.city;
            document.getElementById('state').value = address.state;
            document.getElementById('zipCode').value = address.zipCode;
            document.getElementById('country').value = address.country;
            document.getElementById('defaultAddress').checked = address.isDefault;
            
            addressModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function setDefaultAddress(addressId) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        userData.addresses.forEach(address => {
            address.isDefault = address.id === addressId;
        });
        
        localStorage.setItem('userData', JSON.stringify(userData));
        loadAddresses();
        showNotification('Default address updated', 'success');
    }

    function deleteAddress(addressId) {
        if (confirm('Are you sure you want to delete this address?')) {
            const userData = JSON.parse(localStorage.getItem('userData'));
            userData.addresses = userData.addresses.filter(a => a.id !== addressId);
            
            localStorage.setItem('userData', JSON.stringify(userData));
            loadAddresses();
            showNotification('Address deleted', 'success');
        }
    }

    function removeFromWishlist(productId) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        userData.wishlist = userData.wishlist.filter(item => item.id !== productId);
        
        localStorage.setItem('userData', JSON.stringify(userData));
        loadWishlist();
        showNotification('Item removed from wishlist', 'success');
    }

    function addWishlistItemToCart(productId) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const product = userData.wishlist.find(item => item.id === productId);
        
        if (product) {
            const cartProduct = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            };
            
            // Add to cart
            const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
            const existingItem = cart.items.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.items.push(cartProduct);
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            showNotification(`${product.name} added to cart!`, 'success');
        }
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function updateCartCount() {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
            const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = count;
        }
    }
});