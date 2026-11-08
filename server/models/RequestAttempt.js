const mongoose = require("mongoose");

const requestAttemptSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    count: {
        type: Number,
        required: true,
    },
    windowStartedAt: {
        type: Date,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 0,
    },
});

module.exports = mongoose.model("RequestAttempt", requestAttemptSchema);
