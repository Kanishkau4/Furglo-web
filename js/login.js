// Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Provider type selection
    const providerPills = document.querySelectorAll('.provider-pill');
    providerPills.forEach(pill => {
        pill.addEventListener('click', function() {
            providerPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.width = '100%';
            ripple.style.height = '100%';
            ripple.style.background = 'rgba(255,255,255,0.5)';
            ripple.style.borderRadius = '25px';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Form submission with API integration
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.querySelector('.btn-login');
    const emailInput = document.getElementById('email');
    
    if (loginForm && loginBtn && emailInput && passwordInput) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            
            // Validate inputs
            if (!email) {
                showError('Email is required');
                return;
            }
            
            if (!validateEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            if (!password) {
                showError('Password is required');
                return;
            }
            
            // Show loading state
            showLoading(loginBtn, 'Signing in...');
            
            try {
                // Check if apiUtils is available
                if (typeof apiUtils !== 'undefined') {
                    const response = await apiUtils.loginProfessional(email, password);
                    
                    // Show success message
                    showSuccess('Login successful! Redirecting to dashboard...');
                    
                    // Redirect to dashboard after a short delay
                    setTimeout(() => {
                        window.location.href = 'dashboard.html'; // Create this page or redirect to appropriate URL
                    }, 1500);
                } else {
                    // Fallback if apiUtils is not available
                    console.log('Login attempt:', { email, password });
                    showSuccess('Login successful! (Demo mode)');
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
                
            } catch (error) {
                showError(error.message || 'Login failed. Please try again.');
            } finally {
                hideLoading(loginBtn);
            }
        });
    }

    // Add floating animation to icons on hover
    const floatingIcons = document.querySelectorAll('.floating-icon');
    floatingIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'float 6s ease-in-out infinite';
            }, 10);
        });
    });

    // Parallax effect on mouse move (subtle)
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        floatingIcons.forEach((icon, index) => {
            const speed = (index + 1) * 2;
            icon.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });

    // Add ripple effect to login button
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }

    // Social button hover effects
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.5);
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
    
    // Google OAuth login
    const googleLoginBtn = document.getElementById('googleLogin');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            if (typeof apiUtils !== 'undefined') {
                apiUtils.handleGoogleAuth('professional');
            } else {
                showError('Google login functionality is not available');
            }
        });
    }
    
    // Apple OAuth login (if implemented)
    const appleLoginBtn = document.getElementById('appleLogin');
    if (appleLoginBtn) {
        appleLoginBtn.addEventListener('click', function() {
            showError('Apple login is not yet implemented');
        });
    }
    
    // Forgot password functionality
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = emailInput ? emailInput.value.trim() : '';
            
            if (!email) {
                showError('Please enter your email address first');
                return;
            }
            
            if (!validateEmail(email)) {
                showError('Please enter a valid email address');
                return;
            }
            
            try {
                if (typeof apiUtils !== 'undefined') {
                    await apiUtils.forgotPassword(email, 'professional');
                    showSuccess('Password reset link sent to your email');
                } else {
                    showSuccess('Password reset functionality would be triggered (Demo mode)');
                }
            } catch (error) {
                showError(error.message || 'Failed to send password reset email');
            }
        });
    }

    // Helper functions
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(message) {
        const errorElement = document.getElementById('error-message');
        const successElement = document.getElementById('success-message');
        
        // Hide success message
        if (successElement) {
            successElement.style.display = 'none';
        }
        
        // Show error message
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            // Fallback to alert if no error element
            alert('Error: ' + message);
        }
    }

    function showSuccess(message) {
        const successElement = document.getElementById('success-message');
        const errorElement = document.getElementById('error-message');
        
        // Hide error message
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        // Show success message
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            
            // Auto hide after 4 seconds
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 4000);
        } else {
            // Fallback to alert if no success element
            alert('Success: ' + message);
        }
    }

    function showLoading(button, text = 'Loading...') {
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
            button.textContent = text;
        }
    }

    function hideLoading(button) {
        if (button) {
            button.classList.remove('loading');
            button.disabled = false;
            button.textContent = 'Sign In to Dashboard';
        }
    }
});