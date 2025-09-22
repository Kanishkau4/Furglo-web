/**
 * API Utility Functions for Furglo Pro
 * Handles authentication, API calls, and token management
 */

class APIUtils {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    // Generic API call method
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getAccessToken();
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...options
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...defaultOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                await this.handleErrorResponse(response);
            }
            
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // Handle error responses
    async handleErrorResponse(response) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: 'An error occurred' };
        }

        switch (response.status) {
            case HTTP_STATUS.UNAUTHORIZED:
                this.clearAuthData();
                throw new Error(ERROR_MESSAGES.SESSION_EXPIRED);
            case HTTP_STATUS.BAD_REQUEST:
                throw new Error(errorData.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
            case HTTP_STATUS.CONFLICT:
                throw new Error(errorData.message || 'Email already exists');
            default:
                throw new Error(errorData.message || ERROR_MESSAGES.SERVER_ERROR);
        }
    }

    // Authentication Methods
    
    // Professional Login
    async loginProfessional(email, password) {
        const response = await this.makeRequest(API_ENDPOINTS.PROFESSIONALS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.success) {
            this.saveAuthData(response.data, 'professional');
            return response;
        }
        
        throw new Error(response.message || ERROR_MESSAGES.LOGIN_FAILED);
    }

    // Professional Registration
    async registerProfessional(formData) {
        const response = await this.makeRequest(API_ENDPOINTS.PROFESSIONALS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (response.success) {
            return response;
        }
        
        throw new Error(response.message || ERROR_MESSAGES.REGISTRATION_FAILED);
    }

    // User Login
    async loginUser(email, password) {
        const response = await this.makeRequest(API_ENDPOINTS.USERS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.success) {
            this.saveAuthData(response.data, 'user');
            return response;
        }
        
        throw new Error(response.message || ERROR_MESSAGES.LOGIN_FAILED);
    }

    // User Registration
    async registerUser(formData) {
        const response = await this.makeRequest(API_ENDPOINTS.USERS.REGISTER, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (response.success) {
            return response;
        }
        
        throw new Error(response.message || ERROR_MESSAGES.REGISTRATION_FAILED);
    }

    // Google OAuth
    async handleGoogleAuth(userType) {
        const endpoint = userType === 'professional' 
            ? API_ENDPOINTS.PROFESSIONALS.GOOGLE_AUTH 
            : API_ENDPOINTS.USERS.GOOGLE_AUTH;
        
        window.location.href = `${this.baseURL}${endpoint}`;
    }

    // Logout
    async logout() {
        const userType = this.getUserType();
        const endpoint = userType === 'professional' 
            ? API_ENDPOINTS.PROFESSIONALS.LOGOUT 
            : API_ENDPOINTS.USERS.LOGOUT;
        
        try {
            await this.makeRequest(endpoint, { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuthData();
        }
    }

    // Forgot Password
    async forgotPassword(email, userType) {
        const endpoint = userType === 'professional' 
            ? API_ENDPOINTS.PROFESSIONALS.FORGOT_PASSWORD 
            : API_ENDPOINTS.USERS.FORGOT_PASSWORD;
        
        const response = await this.makeRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        
        return response;
    }

    // Token Management
    
    saveAuthData(authData, userType) {
        localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
        localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_TYPE, userType);
        localStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user || authData.professional));
    }

    getAccessToken() {
        return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    }

    getRefreshToken() {
        return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    }

    getUserType() {
        return localStorage.getItem(AUTH_STORAGE_KEYS.USER_TYPE);
    }

    getUserData() {
        const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    }

    clearAuthData() {
        localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER_TYPE);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA);
    }

    isAuthenticated() {
        return !!this.getAccessToken();
    }

    // Validation Methods
    
    validateEmail(email) {
        return VALIDATION_RULES.EMAIL.test(email);
    }

    validatePassword(password) {
        if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
            return { valid: false, message: ERROR_MESSAGES.PASSWORD_WEAK };
        }
        if (!VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
            return { valid: false, message: ERROR_MESSAGES.PASSWORD_WEAK };
        }
        return { valid: true };
    }

    validatePhone(phone) {
        return VALIDATION_RULES.PHONE.test(phone);
    }

    // UI Helper Methods
    
    showError(message, elementId = 'error-message') {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }

    showSuccess(message, elementId = 'success-message') {
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }

    showLoading(buttonElement, loadingText = 'Processing...') {
        if (buttonElement) {
            buttonElement.disabled = true;
            buttonElement.dataset.originalText = buttonElement.textContent;
            buttonElement.textContent = loadingText;
            buttonElement.classList.add('loading');
        }
    }

    hideLoading(buttonElement) {
        if (buttonElement) {
            buttonElement.disabled = false;
            buttonElement.textContent = buttonElement.dataset.originalText || 'Submit';
            buttonElement.classList.remove('loading');
        }
    }
}

// Create global instance
const apiUtils = new APIUtils();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIUtils;
}