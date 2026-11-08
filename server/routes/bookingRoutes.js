const express = require("express");

const {
    createBooking,
    getMyBookings,
    cancelBooking,
    getAllBookings,
    updateBookingStatus,
    verifyBookingOTP,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { createRequestThrottle } = require("../middleware/requestThrottle");

const router = express.Router();
const fifteenMinutes = 15 * 60 * 1000;

// Create a booking
router.post("/", protect, createRequestThrottle({
    scope: "booking-otp-send",
    limit: 5,
    windowMs: fifteenMinutes,
    getSubject: (req) => req.user.id,
}), createBooking);

// View my bookings
router.get("/my-bookings", protect, getMyBookings);

// Cancel my booking
router.delete("/:id", protect, cancelBooking);

// Admin: view all bookings
router.get("/", protect, adminOnly, getAllBookings);    

router.patch("/:id/status", protect, adminOnly, updateBookingStatus);

router.post("/verify-otp", protect, createRequestThrottle({
    scope: "booking-otp-verify",
    limit: 5,
    windowMs: fifteenMinutes,
    getSubject: (req) => req.user.id,
}), verifyBookingOTP);

module.exports = router;