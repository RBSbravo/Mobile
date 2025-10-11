// Test script to verify API configuration
import config from './src/config/api.config.js';

console.log('API Configuration Test');
console.log('=====================');
console.log('Backend URL:', config.BACKEND_API_URL);
console.log('Timeout:', config.TIMEOUT);
console.log('Retry Attempts:', config.RETRY_ATTEMPTS);
console.log('Auth Endpoints:', config.AUTH_ENDPOINTS);

// Test environment detection
const getEnvironment = () => {
  // Check for development environment first
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'development';
  }
  
  // Check for production environment
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // For PWA/mobile app, always use production backend
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'production';
    }
  }
  
  // Default to production for deployed apps
  return 'production';
};

console.log('Detected Environment:', getEnvironment());

// Test API endpoint construction
const testEndpoint = config.BACKEND_API_URL + config.AUTH_ENDPOINTS.LOGIN;
console.log('Login Endpoint:', testEndpoint);
