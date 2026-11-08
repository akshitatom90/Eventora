const Event = require("../models/Event");

// Create a new event
const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            ticketPrice,
            imageUrl,
        } = req.body;

        if (
            !title ||
            !description ||
            !date ||
            !location ||
            !category ||
            totalSeats == null ||
            ticketPrice == null
        ) {
            return res.status(400).json({
                message: "Please provide all required event details",
            });
        }

        if (!Number.isInteger(totalSeats) || totalSeats < 1) {
            return res.status(400).json({
                message: "totalSeats must be a positive integer",
            });
        }

        const event = await Event.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice,
            imageUrl,
            createdBy: req.user.id,
        });

        return res.status(201).json({
            message: "Event created successfully",
            event,
        });
    } catch (error) {
        console.error("Create event error:", error.message);

        return res.status(500).json({
            message: "Failed to create event",
        });
    }
};

// Get all events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });

        return res.status(200).json({
            count: events.length,
            events,
        });
    } catch (error) {
        console.error("Get events error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch events",
        });
    }
};

// Get a single event by ID
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        return res.status(200).json({ event });
    } catch (error) {
        console.error("Get event by ID error:", error.message);
        return res.status(400).json({
            message: "Invalid event ID",
        });
    }
};

// Update an event
const updateEvent = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
            return res.status(400).json({
                message: "Provide event fields to update",
            });
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "availableSeats")) {
            return res.status(400).json({
                message: "availableSeats is managed by bookings and cannot be updated directly",
            });
        }

        const allowedFields = [
            "title",
            "description",
            "date",
            "location",
            "category",
            "totalSeats",
            "ticketPrice",
            "imageUrl",
        ];
        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
        );

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide at least one valid event field to update",
            });
        }

        if (
            Object.prototype.hasOwnProperty.call(updates, "totalSeats") &&
            (!Number.isInteger(updates.totalSeats) || updates.totalSeats < 1)
        ) {
            return res.status(400).json({
                message: "totalSeats must be a positive integer",
            });
        }

        const currentEvent = await Event.findById(req.params.id);

        if (!currentEvent) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        const capacityChange = Object.prototype.hasOwnProperty.call(updates, "totalSeats")
            ? updates.totalSeats - currentEvent.totalSeats
            : 0;
        delete updates.totalSeats;

        const update = {};
        if (Object.keys(updates).length > 0) {
            update.$set = updates;
        }
        if (capacityChange !== 0) {
            update.$inc = {
                totalSeats: capacityChange,
                availableSeats: capacityChange,
            };
        }

        if (Object.keys(update).length === 0) {
            return res.status(200).json({
                message: "Event updated successfully",
                event: currentEvent,
            });
        }

        const filter = { _id: currentEvent._id, totalSeats: currentEvent.totalSeats };
        if (capacityChange < 0) {
            filter.availableSeats = { $gte: -capacityChange };
        }

        const event = await Event.findOneAndUpdate(filter, update, {
            new: true,
            runValidators: true,
        });

        if (!event) {
            return res.status(409).json({
                message: "Capacity changed or the new capacity is below existing bookings",
            });
        }

        return res.status(200).json({
            message: "Event updated successfully",
            event,
        });
    } catch (error) {
        console.error("Update event error:", error.message);

        return res.status(400).json({
            message: "Failed to update event",
        });
    }
};


// Delete an event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        return res.status(200).json({
            message: "Event deleted successfully",
        });
    } catch (error) {
        return res.status(400).json({
            message: "Failed to delete event",
        });
    }
};
module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
};
