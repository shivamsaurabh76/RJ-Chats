/**
 * @file config/config.js
 * @description Central configuration file for environment variables and app settings
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Server configuration
  PORT: process.env.PORT || 5000,
  
  // Twilio configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  
  // Database configuration
  mongoURI: process.env.MONGO_URI ,
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET ,
};

// Validate required configuration
const validateConfig = () => {
  const requiredKeys = [
    'twilio.accountSid',
    'twilio.authToken',
    'twilio.phoneNumber',
    'mongoURI',
    'jwtSecret'
  ];

  requiredKeys.forEach(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      throw new Error(`Missing required configuration: ${key}`);
    }
  });
};

try {
  validateConfig();
} catch (error) {
  console.error('Configuration Error:', error.message);
  process.exit(1);
}

module.exports = config;