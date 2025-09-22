/**
 * API Configuration for Furglo Pro Pet Management Platform
 * This file contains all backend API endpoints and configuration
 */

// API Configuration
const API_CONFIG = {
    // Base URL for the backend API
    BASE_URL: 'http://localhost:3000/api',
    
    // Timeout for API requests (in milliseconds)
    TIMEOUT: 10000,
    
    // OAuth Configuration
    OAUTH: {
        GOOGLE_CLIENT_ID: 'your_google_client_id', // Replace with actual Google Client ID
        APPLE_CLIENT_ID: 'your_apple_client_id',   // Replace with actual Apple Client ID
        REDIRECT_URI: window.location.origin + '/auth/callback'
    },
    
    // Frontend Application URL
    CLIENT_URL: window.location.origin
};

// API Endpoints
const API_ENDPOINTS = {
    // User Authentication Endpoints
    USERS: {
        REGISTER: '/auth/users/register',
        LOGIN: '/auth/users/login',
        GOOGLE_AUTH: '/auth/users/google',
        APPLE_AUTH: '/auth/users/apple',
        FORGOT_PASSWORD: '/auth/users/forgot-password',
        RESET_PASSWORD: '/auth/users/reset-password',
        VERIFY_EMAIL: '/auth/users/verify-email',
        REFRESH_TOKEN: '/auth/users/refresh-token',
        LOGOUT: '/auth/users/logout',
        PROFILE: '/auth/users/profile'
    },
    
    // Professional Authentication Endpoints  
    PROFESSIONALS: {
        REGISTER: '/auth/professionals/register',
        LOGIN: '/auth/professionals/login',
        GOOGLE_AUTH: '/auth/professionals/google',
        APPLE_AUTH: '/auth/professionals/apple',
        FORGOT_PASSWORD: '/auth/professionals/forgot-password',
        RESET_PASSWORD: '/auth/professionals/reset-password',
        VERIFY_EMAIL: '/auth/professionals/verify-email',
        REFRESH_TOKEN: '/auth/professionals/refresh-token',
        LOGOUT: '/auth/professionals/logout',
        PROFILE: '/auth/professionals/profile'
    }
};

// Authentication Storage Keys
const AUTH_STORAGE_KEYS = {
    ACCESS_TOKEN: 'ecostat_access_token',
    REFRESH_TOKEN: 'ecostat_refresh_token',
    USER_TYPE: 'ecostat_user_type', // 'user' or 'professional'
    USER_DATA: 'ecostat_user_data'
};

// Profession Types (as defined in backend)
const PROFESSION_TYPES = {
    VETERINARIAN: 'veterinarian',
    GROOMER: 'groomer', 
    BOARDING: 'boarding',
    TRAINER: 'trainer',
    PET_SITTER: 'pet_sitter',
    TRANSPORTER: 'transporter',
    DIAGNOSTIC_LAB: 'diagnostic_lab'
};

// Validation Rules
const VALIDATION_RULES = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: {
        MIN_LENGTH: 8,
        PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    },
    PHONE: /^\+?[\d\s\-\(\)]+$/,
    LICENSE: /^[A-Z0-9\-]+$/i
};

// Error Messages
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
    EMAIL_REQUIRED: 'Email address is required.',
    PASSWORD_REQUIRED: 'Password is required.',
    PASSWORD_WEAK: 'Password must be at least 8 characters with uppercase, lowercase, number and special character.',
    EMAIL_INVALID: 'Please enter a valid email address.',
    PHONE_INVALID: 'Please enter a valid phone number.',
    LICENSE_INVALID: 'Please enter a valid license number.',
    REGISTRATION_FAILED: 'Registration failed. Please try again.',
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    SERVER_ERROR: 'Server error. Please try again later.'
};

// Success Messages
const SUCCESS_MESSAGES = {
    REGISTRATION_SUCCESS: 'Registration successful! Please check your email to verify your account.',
    LOGIN_SUCCESS: 'Login successful! Redirecting to dashboard...',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
    EMAIL_VERIFIED: 'Email verified successfully.',
    PROFILE_UPDATED: 'Profile updated successfully.'
};

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
};

// Export configuration for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_CONFIG,
        API_ENDPOINTS,
        AUTH_STORAGE_KEYS,
        PROFESSION_TYPES,
        VALIDATION_RULES,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        HTTP_STATUS
    };
}