
import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [eventForm, setEventForm] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        totalSeats: "",
        ticketPrice: "",
        imageUrl: "",
    });

    const [creating, setCreating] = useState(false);

    const fetchBookings = async () => {
        const response = await api.get("/bookings");
        const data = response.data;

        return Array.isArray(data)
            ? data
            : data.bookings || [];
    };

    useEffect(() => {
        fetchBookings()
            .then(setBookings)
            .catch((err) => {
            setError(
                err.response?.data?.message ||
                "Unable to load bookings."
            );
            })
            .finally(() => setLoading(false));
    }, []);

    const handleEventChange = (e) => {
        const { name, value } = e.target;

        setEventForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setCreating(true);

        try {
            const response = await api.post("/events", {
                ...eventForm,
                totalSeats: Number(eventForm.totalSeats),
                ticketPrice: Number(eventForm.ticketPrice),
            });

            setMessage(
                response.data.message || "Event created successfully."
            );

            setEventForm({
                title: "",
                description: "",
                date: "",
                location: "",
                category: "",
                totalSeats: "",
                ticketPrice: "",
                imageUrl: "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create the event."
            );
        } finally {
            setCreating(false);
        }
    };

    const handleStatusChange = async (bookingId, status) => {
        setError("");
        setMessage("");

        try {
            const response = await api.patch(
                `/bookings/${bookingId}/status`,
                { status }
            );

            setMessage(
                response.data.message ||
                "Booking status updated successfully."
            );

            setBookings(await fetchBookings());
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update booking status."
            );
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-extrabold sm:text-4xl">
                    Admin Dashboard
                </h1>

                <p className="mt-3 text-slate-400">
                    Create events and manage customer bookings.
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

                <section className="mt-10 rounded-2xl border border-white/10 bg-slate-900 p-6">
                    <h2 className="text-2xl font-bold">
                        Create New Event
                    </h2>

                    <form
                        onSubmit={handleCreateEvent}
                        className="mt-6 grid gap-5 sm:grid-cols-2"
                    >
                        <input
                            name="title"
                            value={eventForm.title}
                            onChange={handleEventChange}
                            placeholder="Event title"
                            required
                            className="rounded-lg border border-white/10 bg-slate-950 p-3 outline-none focus:border-violet-500"
                        />

                        <input
                            name="category"
                            value={eventForm.category}
                            onChange={handleEventChange}
                            placeholder="Category"
                            required
                            className="rounded-lg border border-white/10 bg-slate-950 p-3 outline-none focus:border-violet-500"
                        />

                        <input
                            name="date"
                            type="datetime-local"
                            value={eventForm.date}
                            onChange={handleEventChange}
                            required
                            className="rounded-lg border border-white/10 bg-slate-950 p-3 outline-none focus:border-violet-500"
                        />

                        <input
                            name="location"
                            value={eventForm.location}
                            onChange={handleEventChange}
                            placeholder="Location"
                            required
                            className="rounded-lg border border-white/10 bg-slate-950 p-3 outline-none focus:border-violet-500"
                        />

                        <input
                            name="totalSeats"
                            type="number"
                            min="1"
                            value={eventForm.totalSeats}
                            onChange={handleEventChange}
                            placeholder="Total seats"
                            required
                            className="rounded-lg border border-white/10 bg-slate-950 p-3 outline-none focus:border-violet-500"
                        />

                        <input
                            name="ticketPrice"
                            type="number"
                            min="0"
                            value={eventForm.ticketPrice}
                            onChange={handleEventChange}
                            placeholder="Ticket price (₹)"
                            required
                            className="rounded-lg border border-white/10 bg-slate-950 p-3 outline-none focus:border-violet-500"
                        />

                        <input
                            name="imageUrl"
                            type="url"
                            value={eventForm.imageUrl}
                            onChange={handleEventChange}
                            placeholder="Image URL"
                            className="rounded-lg border border-white/10 bg-slate-950 p-3 outline-none focus:border-violet-500 sm:col-span-2"
                        />

                        <textarea
                            name="description"
                            value={eventForm.description}
                            onChange={handleEventChange}
                            placeholder="Event description"
                            required
                            rows="4"
                            className="rounded-lg border border-white/10 bg-slate-950 p-3 outline-none focus:border-violet-500 sm:col-span-2"
                        />

                        <button
                            type="submit"
                            disabled={creating}
                            className="rounded-lg bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50 sm:col-span-2"
                        >
                            {creating ? "Creating..." : "Create Event"}
                        </button>
                    </form>
                </section>

                <section className="mt-10">
                    <h2 className="text-2xl font-bold">
                        Manage Bookings
                    </h2>

                    {loading ? (
                        <p className="mt-6 text-slate-400">
                            Loading bookings...
                        </p>
                    ) : bookings.length === 0 ? (
                        <p className="mt-6 rounded-xl bg-slate-900 p-6 text-slate-400">
                            No bookings found.
                        </p>
                    ) : (
                        <div className="mt-6 space-y-4">
                            {bookings.map((booking) => (
                                <article
                                    key={booking._id}
                                    className="rounded-xl border border-white/10 bg-slate-900 p-5"
                                >
                                    <h3 className="text-lg font-bold">
                                        {booking.eventId?.title || "Event"}
                                    </h3>

                                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                                        <p>
                                            Customer:{" "}
                                            {booking.userId?.name || "Unknown"}
                                        </p>

                                        <p>
                                            Email:{" "}
                                            {booking.userId?.email || "Not available"}
                                        </p>

                                        <p>
                                            Tickets: {booking.numberOfTickets}
                                        </p>

                                        <p>
                                            Status:{" "}
                                            <span className="font-semibold capitalize text-violet-400">
                                                {booking.status}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <label
                                            htmlFor={`status-${booking._id}`}
                                            className="text-sm text-slate-400"
                                        >
                                            Update status:
                                        </label>

                                        <select
                                            id={`status-${booking._id}`}
                                            value={booking.status}
                                            onChange={(e) =>
                                                handleStatusChange(
                                                    booking._id,
                                                    e.target.value
                                                )
                                            }
                                            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white"
                                        >
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="confirmed">
                                                Confirmed
                                            </option>
                                            <option value="cancelled">
                                                Cancelled
                                            </option>
                                        </select>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default AdminDashboard;
