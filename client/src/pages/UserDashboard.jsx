
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const isCancelledBooking = (booking) =>
    ["cancelled", "canceled"].includes(booking.status?.toLowerCase());

const getActiveBookings = (data) =>
    (Array.isArray(data) ? data : data.bookings || []).filter(
        (booking) => !isCancelledBooking(booking)
    );

function UserDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get("/bookings/my-bookings");
                setBookings(getActiveBookings(response.data));
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
                currentBookings.filter(
                    (booking) =>
                        booking._id !== bookingId &&
                        !isCancelledBooking(booking)
                )
            );

            try {
                const bookingsResponse = await api.get("/bookings/my-bookings");
                setBookings(getActiveBookings(bookingsResponse.data));
            } catch {
                setError(
                    "Booking cancelled, but unable to refresh your bookings."
                );
            }
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
                                    <h2 className="text-xl font-bold">
                                        {event?.title || "Event"}
                                    </h2>

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
