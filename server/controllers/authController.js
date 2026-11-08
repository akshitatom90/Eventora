const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require("../models/OTP");
const crypto = require("crypto");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Eventora OTP Verification Code",
        text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });
};

const generateAndSendOTP = async (email, purpose) => {
    const otp = crypto.randomInt(100000, 1000000).toString();

    await OTP.deleteMany({ email, purpose });

    await OTP.create({
        email,
        otp,
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOTPEmail(email, otp);
};

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill in all fields",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered",
            });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        // Generate OTP and send it to the user's email
        await generateAndSendOTP(
            user.email,
            "account_verification"
        );

        return res.status(201).json({
            message: "Registration successful. Please check your email for the OTP.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Registration failed",
        });
    }
};

const resendVerificationOTP = async (req, res) => {
    const message = "If an unverified account exists for this email, a verification code has been sent.";

    try {
        const email = req.body.email?.trim().toLowerCase();
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email, isVerified: false });
        if (user) {
            await generateAndSendOTP(email, "account_verification");
        }

        return res.status(200).json({ message });
    } catch (error) {
        console.error("Resend verification OTP error:", error.message);
        return res.status(200).json({ message });
    }
};

// Verify account OTP
const verifyOTP = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }

        const otpRecord = await OTP.findOne({
            email,
            otp,
            purpose: "account_verification",
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.isVerified = true;
        await user.save();

        await OTP.deleteMany({
            email,
            purpose: "account_verification",
        });

        return res.status(200).json({
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("OTP verification error:", error.message);

        return res.status(500).json({
            message: "OTP verification failed",
        });
    }
};
// Login an existing user

const loginUser = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const { password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in",
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Login failed",
        });
    }
};

module.exports = { registerUser, loginUser, verifyOTP, resendVerificationOTP };
