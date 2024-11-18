const asyncHandler = require("express-async-handler");
const twilio = require("twilio");
const dotenv = require("dotenv");

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Initialize Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// In-memory OTP storage (replace with your database solution in production)
const otpStore = new Map();

const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If number doesn't start with 91 and has 10 digits, add 91
  if (cleaned.length === 10 && !cleaned.startsWith('91')) {
    cleaned = '91' + cleaned;
  }
  
  // Always add the + prefix for E.164 format
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

const isValidPhoneNumber = (phoneNumber) => {
  // Basic Indian phone number validation
  const phoneRegex = /^(\+?91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phoneNumber.replace(/\D/g, ''));
};

const sendOTP = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;
  console.log("Received sendOTP request for:", phoneNumber);

  if (!phoneNumber) {
    res.status(400);
    throw new Error("Phone number is required");
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    res.status(400);
    throw new Error("Invalid phone number format. Please enter a valid Indian mobile number.");
  }

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Format phone number
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    
    console.log(`Attempting to send OTP to ${formattedPhoneNumber}`);

    // Store OTP with expiration time (10 minutes)
    otpStore.set(formattedPhoneNumber, {
      otp: otp.toString(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`Development mode: OTP for ${formattedPhoneNumber} is ${otp}`);
      return res.json({ 
        success: true, 
        message: 'OTP sent successfully (Development mode)',
        otp // Only include in development!
      });
    }

    // Production mode - use Twilio
    const message = await client.messages.create({
      body: `Your RJ Chats verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhoneNumber
    });

    console.log(`OTP sent successfully to ${formattedPhoneNumber}. Message SID: ${message.sid}`);

    res.status(200).json({ 
      success: true,
      message: "OTP sent successfully",
      messageId: message.sid
    });

  } catch (error) {
    console.error('Twilio Error:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      res.status(400);
      throw new Error("Invalid phone number format. Please check the number and try again.");
    }
    else if (error.code === 21408) {
      res.status(400);
      throw new Error("This number is not verified with Twilio trial account. Please use a verified number or upgrade your Twilio account.");
    }
    else if (error.code === 21408) {
      res.status(400);
      throw new Error("SMS service is not available in this region.");
    }
    else {
      res.status(error.status || 500);
      throw new Error(error.message || "Failed to send OTP. Please try again later.");
    }
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  console.log("Received verifyOTP request body:", req.body);
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    res.status(400);
    throw new Error("Phone number and OTP are required");
  }

  const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
  console.log("Formatted phone number:", formattedPhoneNumber);
  console.log("Checking OTP store for:", formattedPhoneNumber);
  console.log("Current OTP store:", Array.from(otpStore.entries()));

  const storedData = otpStore.get(formattedPhoneNumber);

  if (!storedData) {
    res.status(400);
    throw new Error("No OTP found for this number. Please request a new OTP.");
  }

  console.log("Stored OTP data:", storedData);
  console.log("Received OTP:", otp);
  console.log("Comparing with stored OTP:", storedData.otp);

  if (Date.now() > storedData.expiresAt) {
    // Clean up expired OTP
    otpStore.delete(formattedPhoneNumber);
    res.status(400);
    throw new Error("OTP has expired. Please request a new one.");
  }

  if (storedData.otp !== otp) {
    res.status(400);
    throw new Error("Invalid OTP. Please try again.");
  }

  // Clean up used OTP
  otpStore.delete(formattedPhoneNumber);

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    verified: true
  });
});

module.exports = { sendOTP, verifyOTP };