import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
               const response = await api.get("/bookings/my-bookings");
                const data = response.data;

                setBookings(
                    Array.isArray(data) ? data : data.bookings || []
                );
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Unable to load your bookings."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const response = await api.delete(`/bookings/${bookingId}`);

            setBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    booking._id === bookingId
                        ? { ...booking, status: "cancelled" }
                        : booking
                )
            );

            setMessage(
                response.data.message || "Booking cancelled successfully."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to cancel this booking."
            );
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-950 p-10 text-center text-white">
                Loading your bookings...
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-extrabold sm:text-4xl">
                    My Dashboard
                </h1>

                <p className="mt-3 text-slate-400">
                    View and manage your event bookings.
                </p>

                {message && (
                    <p className="mt-6 rounded-lg bg-green-500/10 p-4 text-green-400">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="mt-6 rounded-lg bg-red-500/10 p-4 text-red-400">
                        {error}
                    </p>
                )}

                {bookings.length === 0 ? (
                    <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
                        <h2 className="text-xl font-bold">
                            No bookings yet
                        </h2>

                        <p className="mt-3 text-slate-400">
                            Explore events and book your first ticket.
                        </p>

                        <Link
                            to="/events"
                            className="mt-6 inline-block rounded-lg bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
                        >
                            Explore Events
                        </Link>
                    </section>
                ) : (
                    <div className="mt-8 grid gap-5">
                        {bookings.map((booking) => {
                            const event = booking.eventId;

                            return (
                                <article
                                    key={booking._id}
                                    className="rounded-2xl border border-white/10 bg-slate-900 p-6"
                                >
                                    <h2 className="text-xl font-bold">
                                        {event?.title || "Event details unavailable"}
                                    </h2>

                                    <div className="mt-4 space-y-2 text-slate-300">
                                        <p>
                                            Date:{" "}
                                            {event?.date
                                                ? new Date(
                                                      event.date
                                                  ).toLocaleDateString("en-IN")
                                                : "Not available"}
                                        </p>

                                        <p>
                                            Location:{" "}
                                            {event?.location || "Not available"}
                                        </p>

                                        <p>
                                            Tickets: {booking.numberOfTickets}
                                        </p>

                                        <p>
                                            Total: ₹{booking.totalAmount}
                                        </p>

                                        <p>
                                            Status:{" "}
                                            <span
                                                className={
                                                    booking.status === "confirmed"
                                                        ? "font-semibold text-green-400"
                                                        : booking.status === "cancelled"
                                                        ? "font-semibold text-red-400"
                                                        : "font-semibold text-yellow-400"
                                                }
                                            >
                                                {booking.status}
                                            </span>
                                        </p>
                                    </div>

                                    {booking.status !== "cancelled" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleCancel(booking._id)
                                            }
                                            className="mt-5 rounded-lg border border-red-500/50 px-4 py-2 text-red-400 hover:bg-red-500/10"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

export default Dashboard;
