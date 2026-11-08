
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function EventDetails() {
    const { id } = useParams();

    const [event, setEvent] = useState(null);
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState("details");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const isLoggedIn = Boolean(localStorage.getItem("token"));

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/events/${id}`);
                setEvent(response.data.event || response.data);
            } catch (err) {
                console.error("Error fetching event:", err);
                setError("Unable to load this event.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSubmitting(true);

        try {
            const response = await api.post("/bookings", {
                eventId: id,
                numberOfTickets: Number(numberOfTickets),
            });

            setMessage(
                response.data.message ||
                    "OTP sent to your registered email."
            );
            setStep("verify");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to start your booking. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSubmitting(true);

        try {
            const response = await api.post("/bookings/verify-otp", {
                otp,
            });

            setMessage(
                response.data.message || "Booking created successfully."
            );
            setStep("success");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "OTP verification failed. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 p-10 text-center text-white">
                Loading event...
            </main>
        );
    }

    if (error && !event) {
        return (
            <main className="min-h-screen bg-slate-950 p-10 text-center text-white">
                <p className="text-red-400">{error}</p>
                <Link to="/events" className="mt-4 inline-block text-violet-400">
                    Back to Events
                </Link>
            </main>
        );
    }

    if (!event) {
        return (
            <main className="min-h-screen bg-slate-950 p-10 text-center text-white">
                Event not found.
                <Link to="/events" className="mt-4 block text-violet-400">
                    Back to Events
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
            <div className="mx-auto max-w-4xl">
                {event.imageUrl && (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="mb-8 h-72 w-full rounded-2xl object-cover sm:h-96"
                    />
                )}

                <h1 className="text-4xl font-extrabold">{event.title}</h1>

                <p className="mt-5 leading-7 text-slate-300">
                    {event.description}
                </p>

                <div className="mt-6 space-y-3 text-slate-300">
                    <p>Location: {event.location}</p>
                    <p>
                        Date:{" "}
                        {event.date
                            ? new Date(event.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                              })
                            : "Not specified"}
                    </p>
                    <p className="text-xl font-bold text-violet-400">
                        Ticket price: ₹{event.ticketPrice}
                    </p>
                </div>

                <section className="mt-8 max-w-md rounded-xl border border-white/10 bg-slate-900 p-6">
                    {step === "details" && (
                        <>
                            <h2 className="text-2xl font-bold">Book Tickets</h2>

                            {!isLoggedIn ? (
                                <>
                                    <p className="mt-3 text-slate-400">
                                        Log in to book tickets for this event.
                                    </p>
                                    <Link
                                        to="/login"
                                        className="mt-5 inline-block rounded-lg bg-violet-500 px-6 py-3 font-semibold hover:bg-violet-400"
                                    >
                                        Log In to Continue
                                    </Link>
                                </>
                            ) : (
                                <form
                                    onSubmit={handleBooking}
                                    className="mt-5 space-y-5"
                                >
                                    <div>
                                        <label
                                            htmlFor="numberOfTickets"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Number of tickets
                                        </label>

                                        <input
                                            id="numberOfTickets"
                                            type="number"
                                            min="1"
                                            step="1"
                                            required
                                            value={numberOfTickets}
                                            onChange={(e) =>
                                                setNumberOfTickets(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-violet-400"
                                        />
                                    </div>

                                    <p className="text-lg font-semibold">
                                        Total: ₹
                                        {(
                                            Number(event.ticketPrice) *
                                            Number(numberOfTickets)
                                        ).toLocaleString("en-IN")}
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={
                                            submitting ||
                                            !Number.isInteger(
                                                Number(numberOfTickets)
                                            ) ||
                                            Number(numberOfTickets) < 1
                                        }
                                        className="w-full rounded-lg bg-violet-500 px-5 py-3 font-semibold hover:bg-violet-400 disabled:opacity-60"
                                    >
                                        {submitting
                                            ? "Sending OTP..."
                                            : "Continue to Verify"}
                                    </button>
                                </form>
                            )}
                        </>
                    )}

                    {step === "verify" && (
                        <>
                            <h2 className="text-2xl font-bold">
                                Verify Your Booking
                            </h2>
                            <p className="mt-3 text-slate-400">
                                Enter the OTP sent to your registered email to
                                complete your booking.
                            </p>

                            <form
                                onSubmit={handleVerifyOtp}
                                className="mt-5 space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="bookingOtp"
                                        className="mb-2 block text-sm font-medium"
                                    >
                                        Booking OTP
                                    </label>
                                    <input
                                        id="bookingOtp"
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-violet-400"
                                        placeholder="Enter your OTP"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-lg bg-violet-500 px-5 py-3 font-semibold hover:bg-violet-400 disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Verifying..."
                                        : "Verify and Book"}
                                </button>
                            </form>
                        </>
                    )}

                    {step === "success" && (
                        <>
                            <h2 className="text-2xl font-bold text-green-400">
                                Booking Successful
                            </h2>
                            <p className="mt-3 text-slate-300">
                                Your booking has been created successfully.
                            </p>
                            <Link
                                to="/"
                                className="mt-5 inline-block rounded-lg bg-violet-500 px-6 py-3 font-semibold hover:bg-violet-400"
                            >
                                Back to Home
                            </Link>
                        </>
                    )}

                    {message && step !== "success" && (
                        <p className="mt-4 text-sm text-green-400">{message}</p>
                    )}

                    {error && (
                        <p className="mt-4 text-sm text-red-400">{error}</p>
                    )}
                </section>
            </div>
        </main>
    );
}

export default EventDetails;
