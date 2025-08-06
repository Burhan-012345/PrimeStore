document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLogin = document.getElementById('backToLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlert = document.getElementById('closeAlert');
    const regUserIdInput = document.getElementById('regUserId');
    
    // Initialize local storage if empty
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([
            { 
                username: 'admin', 
                userId: 'ADM' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                email: 'admin@example.com', 
                password: 'admin123',
                canResetPassword: true
            }
        ]));
    }
    
    // Generate random user ID
    function generateUserId() {
        const prefix = 'USR';
        const randomString = Math.random().toString(36).substr(2, 8).toUpperCase();
        return prefix + randomString;
    }
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('bx-hide');
            this.classList.toggle('bx-show');
        });
    });
    
    // Copy User ID to clipboard
    document.querySelectorAll('.copy-user-id').forEach(icon => {
        icon.addEventListener('click', function() {
            const userId = this.parentElement.querySelector('input').value;
            if (userId) {
                navigator.clipboard.writeText(userId).then(() => {
                    showAlert('User ID copied to clipboard!', true);
                }).catch(err => {
                    showAlert('Failed to copy User ID', false);
                    console.error('Failed to copy: ', err);
                });
            }
        });
    });
    
    // Show alert message
    function showAlert(message, isSuccess) {
        alertMessage.textContent = message;
        alertBox.className = `alert-box ${isSuccess ? 'success' : 'error'} show`;
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 3000);
    }
    
    // Close alert manually
    closeAlert.addEventListener('click', () => {
        alertBox.classList.remove('show');
    });
    
    // Toggle between login and register forms
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
        hideForgotPassword();
        // Generate and display user ID when switching to registration form
        regUserIdInput.value = generateUserId();
    });
    
    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
        hideForgotPassword();
    });
    
    // Show forgot password form
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        showForgotPassword();
    });
    
    // Back to login from forgot password
    backToLogin.addEventListener('click', () => {
        hideForgotPassword();
    });
    
    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            showAlert('Login successful! Redirecting...', true);
            // Set user as logged in
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Check if this was a cart-related action
            const fromCartAction = sessionStorage.getItem('fromCartAction') === 'true';
            
            setTimeout(() => {
                if (fromCartAction) {
                    // Clear the session storage
                    sessionStorage.removeItem('fromCartAction');
                    sessionStorage.removeItem('preLoginUrl');
                    window.location.href = 'cart.html';
                } else {
                    // Redirect to dashboard
                    window.location.href = 'index.html';
                }
            }, 1500);
        } else {
            showAlert('Invalid username or password. Redirecting to registration...', false);
            // Fill registration form with login attempt details
            document.getElementById('regUsername').value = username;
            document.getElementById('regPassword').value = password;
            // Generate and display user ID
            document.getElementById('regUserId').value = generateUserId();
            // Switch to registration form
            setTimeout(() => {
                container.classList.add('active');
            }, 1500);
        }
    });
    
    // Register form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const userId = document.getElementById('regUserId').value;
        
        const users = JSON.parse(localStorage.getItem('users'));
        
        // Check if username already exists
        if (users.some(u => u.username === username)) {
            showAlert('Username already exists', false);
            return;
        }
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            showAlert('Email already registered', false);
            return;
        }
        
        // Create new user object
        const newUser = { 
            username, 
            userId,
            email, 
            password,
            canResetPassword: true
        };
        
        // Add new user
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Set user as logged in
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        showAlert(`Registration successful! Your User ID is ${userId} (save this for password recovery)`, true);
        
        // Check if this was a cart-related action
        const fromCartAction = sessionStorage.getItem('fromCartAction') === 'true';
        
        setTimeout(() => {
            if (fromCartAction) {
                // Clear the session storage
                sessionStorage.removeItem('fromCartAction');
                sessionStorage.removeItem('preLoginUrl');
                window.location.href = 'cart.html';
            } else {
                // Reset forms and redirect to dashboard
                container.classList.remove('active');
                loginForm.reset();
                registerForm.reset();
                window.location.href = 'index.html';
            }
        }, 1500);
    });
    
    // Forgot password form submission
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('forgotUsername').value;
        const userId = document.getElementById('forgotUserId').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            showAlert('Passwords do not match', false);
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.username === username && u.userId === userId);
        
        if (userIndex === -1) {
            showAlert('Username or User ID not found', false);
            return;
        }
        
        // Check if password reset is allowed
        if (!users[userIndex].canResetPassword) {
            showAlert('Password reset not allowed for this account', false);
            return;
        }
        
        // Update password and disable future resets
        users[userIndex].password = newPassword;
        users[userIndex].canResetPassword = false;
        localStorage.setItem('users', JSON.stringify(users));
        
        showAlert('Password updated successfully! You cannot reset it again.', true);
        hideForgotPassword();
        forgotPasswordForm.reset();
    });
    
    function showForgotPassword() {
        document.querySelector('.login').style.display = 'none';
        document.querySelector('.register').style.display = 'none';
        document.querySelector('.forgot-password').style.display = 'flex';
        container.classList.remove('active');
    }
    
    function hideForgotPassword() {
        document.querySelector('.login').style.display = 'flex';
        document.querySelector('.register').style.display = 'flex';
        document.querySelector('.forgot-password').style.display = 'none';
    }
});