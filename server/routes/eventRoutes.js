const express = require("express");

const {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware.js");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

// Get all events
router.get("/", getEvents);

router.get("/:id", getEventById);

// Create an event (login required)
router.post("/", protect, adminOnly, createEvent);

router.put("/:id", protect, adminOnly, updateEvent);

router.delete("/:id", protect, adminOnly, deleteEvent);

module.exports = router;