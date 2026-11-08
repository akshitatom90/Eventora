
const express = require("express");
const {
    registerUser,
    loginUser,
    verifyOTP,
    resendVerificationOTP,
} = require("../controllers/authController.js");
const { createRequestThrottle } = require("../middleware/requestThrottle");

const fifteenMinutes = 15 * 60 * 1000;
const router = express.Router();

router.post("/register", createRequestThrottle({
    scope: "auth-email-otp-send",
    limit: 3,
    windowMs: fifteenMinutes,
    getSubject: (req) => req.body?.email,
}), registerUser);
router.post("/login", createRequestThrottle({
    scope: "auth-login",
    limit: 10,
    windowMs: fifteenMinutes,
    getSubject: (req) => req.body?.email,
}), loginUser);
router.post("/verify-otp", createRequestThrottle({
    scope: "auth-otp-verify",
    limit: 5,
    windowMs: fifteenMinutes,
    getSubject: (req) => req.body?.email,
}), verifyOTP);
router.post("/resend-otp", createRequestThrottle({
    scope: "auth-email-otp-send",
    limit: 3,
    windowMs: fifteenMinutes,
    getSubject: (req) => req.body?.email,
}), resendVerificationOTP);

module.exports = router;
