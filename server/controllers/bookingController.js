
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { sendEmail } = require("../utils/emailService");
const crypto = require("crypto");

// Request a booking OTP
const createBooking = async (req, res) => {
    try {
        const { eventId, numberOfTickets } = req.body;

        if (
            !eventId ||
            !Number.isInteger(numberOfTickets) ||
            numberOfTickets < 1
        ) {
            return res.status(400).json({
                message: "Provide a valid event ID and number of tickets",
            });
        }

        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        if (event.availableSeats < numberOfTickets) {
            return res.status(400).json({
                message: "Not enough seats available",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        await OTP.deleteMany({
            email: user.email,
            purpose: "event_booking",
        });

        await OTP.create({
            email: user.email,
            otp,
            purpose: "event_booking",
            eventId: event._id,
            numberOfTickets,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await sendEmail({
            to: user.email,
            subject: "Eventora Booking OTP",
            text: `Your OTP for booking ${event.title} is ${otp}. It expires in 5 minutes.`,
        });

        return res.status(200).json({
            message:
                "OTP sent to your registered email. Verify it to complete your booking.",
        });
    } catch (error) {
        console.error("Create booking OTP error:", error.message);

        return res.status(500).json({
            message: "Failed to send booking OTP",
        });
    }
};

// Verify OTP and create the booking
const verifyBookingOTP = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({
                message: "OTP is required",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const otpRecord = await OTP.findOneAndDelete({
            email: user.email,
            otp,
            purpose: "event_booking",
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }

        const tickets = otpRecord.numberOfTickets;

        // Reserve seats atomically.
        const updatedEvent = await Event.findOneAndUpdate(
            {
                _id: otpRecord.eventId,
                availableSeats: { $gte: tickets },
            },
            {
                $inc: { availableSeats: -tickets },
            },
            {
                new: true,
            }
        );

        if (!updatedEvent) {
            return res.status(400).json({
                message: "Event not found or not enough seats available",
            });
        }

        let booking;

        try {
            booking = await Booking.create({
                userId: user._id,
                eventId: updatedEvent._id,
                numberOfTickets: tickets,
                totalAmount: updatedEvent.ticketPrice * tickets,
            });
        } catch (error) {
            // Restore seats if booking creation fails.
            await Event.findByIdAndUpdate(updatedEvent._id, {
                $inc: { availableSeats: tickets },
            });

            throw error;
        }

        // Delete the used OTP after successful booking creation.
        await OTP.deleteMany({
            email: user.email,
            purpose: "event_booking",
        });

        return res.status(201).json({
            message: "Booking created successfully",
            booking,
        });
    } catch (error) {
        console.error("Verify booking OTP error:", error.message);

        return res.status(500).json({
            message: "Failed to verify booking OTP",
        });
    }
};

// Get bookings for the logged-in user
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            userId: req.user.id,
            hiddenFromUser: { $ne: true },
        })
            .populate("eventId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        console.error("Get bookings error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch bookings",
        });
    }
};

// Cancel a booking
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate({
            _id: req.params.id,
            userId: req.user.id,
            status: { $in: ["pending", "confirmed"] },
        }, {
            $set: { status: "cancelled" },
        }, {
            new: true,
        });

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found or already cancelled",
            });
        }

        await Event.findByIdAndUpdate(booking.eventId, {
            $inc: { availableSeats: booking.numberOfTickets },
        });

        return res.status(200).json({
            message: "Booking cancelled successfully",
            booking,
        });
    } catch (error) {
        console.error("Cancel booking error:", error.message);

        return res.status(500).json({
            message: "Failed to cancel booking",
        });
    }
};

// Hide a booking from the logged-in user's history (soft delete)
const hideBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.id,
            },
            { $set: { hiddenFromUser: true } },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
            });
        }

        return res.status(200).json({
            message: "Booking removed from your history.",
            booking,
        });
    } catch (error) {
        console.error("Hide booking error:", error.message);

        return res.status(500).json({
            message: "Failed to remove booking from your history",
        });
    }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("userId", "name email")
            .populate("eventId", "title date location")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        console.error("Get all bookings error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch all bookings",
        });
    }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!["pending", "confirmed", "cancelled"].includes(status)) {
            return res.status(400).json({
                message: "Invalid booking status",
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found",
            });
        }

        if (booking.status === "cancelled" && status !== "cancelled") {
            return res.status(400).json({
                message: "A cancelled booking cannot be reactivated.",
            });
        }

        if (booking.status === status) {
            return res.status(200).json({
                message: "Booking status updated successfully",
                booking,
            });
        }

        const updatedBooking = await Booking.findOneAndUpdate(
            {
                _id: booking._id,
                status: booking.status,
            },
            { $set: { status } },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(409).json({
                message: "Booking status changed; please retry",
            });
        }

        if (status === "cancelled") {
            await Event.findByIdAndUpdate(updatedBooking.eventId, {
                $inc: { availableSeats: updatedBooking.numberOfTickets },
            });
        }

        return res.status(200).json({
            message: "Booking status updated successfully",
            booking: updatedBooking,
        });
    } catch (error) {
        console.error("Update booking status error:", error.message);

        return res.status(500).json({
            message: "Failed to update booking status",
        });
    }
};

module.exports = {
    createBooking,
    verifyBookingOTP,
    getMyBookings,
    cancelBooking,
    hideBooking,
    getAllBookings,
    updateBookingStatus,
};
