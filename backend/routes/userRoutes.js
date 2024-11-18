const express = require("express");
const router = express.Router();
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const { googleAuth } = require("../controllers/googleAuthController");
const { sendOTP, verifyOTP } = require("../controllers/otpController");

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Request Body:', req.body);
  next();
};

// Apply debug middleware to all routes
router.use(debugMiddleware);

// User routes
router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);
router.post("/api/user/google-auth", googleAuth);

// OTP routes with explicit error handling
router.post("/sendotp", async (req, res) => {
  try {
    await sendOTP(req, res);
  } catch (error) {
    console.error("sendOTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP"
    });
  }
});

router.post("/verifyotp", async (req, res) => {
  try {
    console.log("Verify OTP endpoint hit with body:", req.body);
    await verifyOTP(req, res);
  } catch (error) {
    console.error("verifyOTP error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP"
    });
  }
});

module.exports = router;