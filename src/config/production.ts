// Production configuration
export const PRODUCTION_CONFIG = {
  // Update this with your production server URL
  API_URL: process.env.API_URL || 'https://your-production-domain.com/api',
  
  // Location update intervals (in milliseconds)
  LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
  LOCATION_SNAPSHOT_INTERVAL: 21600000, // 6 hours
  
  // App settings
  APP_NAME: 'Mandinex Driver',
  VERSION: '1.0.0',
  
  // Feature flags
  FEATURES: {
    BACKGROUND_LOCATION: true,
    PUSH_NOTIFICATIONS: true,
    CRASH_REPORTING: true,
    ANALYTICS: true
  },
  
  // Security
  MIN_PIN_LENGTH: 6,
  SESSION_TIMEOUT: 86400000, // 24 hours
  
  // Performance
  IMAGE_QUALITY: 0.8,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
};
