// API Configuration for Mobile App

const API_CONFIG = {
  // Development
  development: {
    BACKEND_API_URL: 'http://192.168.100.59:3000/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
  },
  
  // Production
  production: {
    BACKEND_API_URL: 'https://backend-ticketing-system.up.railway.app/api',
    TIMEOUT: 15000,
    RETRY_ATTEMPTS: 2,
  },
  
  // Testing
  testing: {
    BACKEND_API_URL: 'http://localhost:3000/api',
    TIMEOUT: 5000,
    RETRY_ATTEMPTS: 1,
  }
};

// Get current environment
const getEnvironment = () => {
  // Check for production environment
  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost') {
    return 'production';
  }
  // You can set this via environment variables or build configuration
  if (__DEV__) {
    return 'development';
  }
  // Default to production for web builds
  return 'production';
};

// Export current config
const currentConfig = API_CONFIG[getEnvironment()];

export default {
  ...currentConfig,
  // Additional app-specific config
  APP_NAME: 'MITO Task Manager Mobile App',
  APP_VERSION: '1.0.0',
  
  // Auth endpoints
  AUTH_ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
  }
}; 