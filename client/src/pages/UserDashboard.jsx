
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const isCancelledBooking = (booking) =>
    ["cancelled", "canceled"].includes(booking.status?.toLowerCase());

const getBookings = (data) =>
    Array.isArray(data) ? data : data.bookings || [];

function UserDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get("/bookings/my-bookings");
                setBookings(getBookings(response.data));
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

            setMessage(
                response.data.message || "Booking cancelled successfully."
            );

            setBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    booking._id === bookingId
                        ? { ...booking, status: "cancelled" }
                        : booking
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to cancel this booking."
            );
        }
    };

    const handleHide = async (bookingId) => {
        const confirmed = window.confirm(
            "Remove this booking from your history? The event organiser will still be able to see it."
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const response = await api.delete(`/bookings/${bookingId}/hide`);

            setMessage(
                response.data.message || "Booking removed from your history."
            );

            setBookings((currentBookings) =>
                currentBookings.filter(
                    (booking) => booking._id !== bookingId
                )
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Unable to remove this booking from your history."
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
                <h1 className="text-3xl font-bold sm:text-4xl">
                    My Bookings
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
                    <div className="mt-10 rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
                        <h2 className="text-xl font-semibold">
                            No bookings yet
                        </h2>

                        <p className="mt-3 text-slate-400">
                            Explore events and book your first ticket.
                        </p>

                        <Link
                            to="/events"
                            className="mt-6 inline-block rounded-lg bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
                        >
                            Explore Events
                        </Link>
                    </div>
                ) : (
                    <div className="mt-8 space-y-5">
                        {bookings.map((booking) => {
                            const event = booking.eventId;

                            return (
                                <article
                                    key={booking._id}
                                    className="rounded-2xl border border-white/10 bg-slate-900 p-6"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <h2 className="text-xl font-bold">
                                            {event?.title || "Event"}
                                        </h2>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleHide(booking._id)
                                            }
                                            aria-label="Remove from history"
                                            title="Remove from history"
                                            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-red-400"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="mt-4 space-y-2 text-slate-300">
                                        <p>
                                            Tickets:{" "}
                                            {booking.numberOfTickets}
                                        </p>

                                        <p>
                                            Booking status:{" "}
                                            <span className="font-semibold capitalize text-violet-400">
                                                {booking.status}
                                            </span>
                                        </p>

                                        {event?.date && (
                                            <p>
                                                Event date:{" "}
                                                {new Date(
                                                    event.date
                                                ).toLocaleDateString("en-IN")}
                                            </p>
                                        )}

                                        {event?.location && (
                                            <p>
                                                Location: {event.location}
                                            </p>
                                        )}
                                    </div>

                                    {!isCancelledBooking(booking) && (
                                        <button
                                            onClick={() =>
                                                handleCancel(booking._id)
                                            }
                                            className="mt-5 rounded-lg border border-red-500/40 px-4 py-2 text-red-400 hover:bg-red-500/10"
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

export default UserDashboard;
