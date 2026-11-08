const crypto = require("crypto");
const RequestAttempt = require("../models/RequestAttempt");

const consumeAttempt = async (key, limit, windowMs) => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const now = new Date();
        const cutoff = new Date(now.getTime() - windowMs);
        const activeAttempt = await RequestAttempt.findOneAndUpdate(
            { _id: key, windowStartedAt: { $gt: cutoff } },
            { $inc: { count: 1 } },
            { new: true }
        );

        if (activeAttempt) {
            return activeAttempt.count <= limit;
        }

        const resetAttempt = await RequestAttempt.findOneAndUpdate(
            { _id: key, windowStartedAt: { $lte: cutoff } },
            {
                $set: {
                    count: 1,
                    windowStartedAt: now,
                    expiresAt: new Date(now.getTime() + windowMs),
                },
            },
            { new: true }
        );

        if (resetAttempt) {
            return true;
        }

        try {
            await RequestAttempt.findOneAndUpdate(
                { _id: key },
                {
                    $setOnInsert: {
                        count: 0,
                        windowStartedAt: now,
                        expiresAt: new Date(now.getTime() + windowMs),
                    },
                },
                { upsert: true, new: true }
            );
        } catch (error) {
            if (error.code !== 11000) {
                throw error;
            }
        }
    }

    throw new Error("Unable to update request throttle counter");
};

const createRequestThrottle = ({ scope, limit, windowMs, getSubject }) =>
    async (req, res, next) => {
        const values = [`ip:${req.ip || req.socket.remoteAddress || "unknown"}`];
        const subject = getSubject ? getSubject(req) : null;
        if (subject) {
            values.push(`subject:${String(subject).trim().toLowerCase()}`);
        }

        try {
            for (const value of values) {
                const key = crypto
                    .createHash("sha256")
                    .update(`${scope}:${value}`)
                    .digest("hex");
                if (!(await consumeAttempt(key, limit, windowMs))) {
                    return res.status(429).json({
                        message: "Too many attempts. Please try again later.",
                        retryAfterSeconds: Math.ceil(windowMs / 1000),
                    });
                }
            }

            return next();
        } catch (error) {
            console.error("Request throttle error:", error.message);
            return res.status(503).json({
                message: "Request protection is temporarily unavailable",
            });
        }
    };

module.exports = { createRequestThrottle };
