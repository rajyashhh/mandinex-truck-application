// API Configuration
// Update the PRODUCTION_URL when you deploy your server

const DEV_URL = 'http://192.168.43.20:3001';
const PRODUCTION_URL = 'https://mandinex-truck-application.onrender.com';

// For testing with ngrok, update this:
// const PRODUCTION_URL = 'https://abc123.ngrok.io';

export const API_CONFIG = {
  BASE_URL: __DEV__ ? DEV_URL : PRODUCTION_URL,
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    SEND_OTP: '/api/send-otp',
    VERIFY_OTP: '/api/verify-otp',
    
    // Driver
    UPDATE_DRIVER: '/api/update-driver',
    GET_DRIVER: '/api/driver',
    
    // Location
    UPDATE_LOCATION: '/api/update-location',
    GET_LOCATION: '/api/get-location',
    
    // Trips
    START_TRIP: '/api/start-trip',
    END_TRIP: '/api/end-trip',
    GET_TRIPS: '/api/trips',
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
