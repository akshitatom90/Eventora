const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend requires a verified sending domain. Until you verify one, you can
// use their test sender "onboarding@resend.dev" (only sends to your own email).
const FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || "Eventora <onboarding@resend.dev>";

/**
 * Send an email through Resend.
 * @param {{ to: string|string[], subject: string, text?: string, html?: string }} options
 * @returns {Promise<object>} Resend email payload
 */
const sendEmail = async ({ to, subject, text, html }) => {
    const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        text,
        html,
    });

    if (error) {
        console.error("Resend email error:", error);
        throw new Error(error.message);
    }

    return data;
};

module.exports = { sendEmail, FROM_EMAIL };
