import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../services/eventService";


function Events() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
       const fetchEvents = async () => {
    try {
        const eventList = await getEvents();
        setEvents(eventList);
    } catch (err) {
        console.error("Error fetching events:", err);
        setError("Unable to load events. Please try again later.");
    } finally {
        setLoading(false);
    }
};

fetchEvents();
    }, []);

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
            <div className="mx-auto max-w-7xl">
                {/* Page heading */}
                <section className="mb-10">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-400">
                        Find your next experience
                    </p>

                    <h1 className="text-4xl font-extrabold sm:text-5xl">
                        Explore Events
                    </h1>

                    <p className="mt-4 max-w-2xl leading-7 text-slate-400">
                        Discover concerts, technology meetups, art
                        exhibitions, and more. Find an event that interests
                        you and plan your next experience.
                    </p>
                </section>

                {/* Loading */}
                {loading && (
                    <p className="py-12 text-center text-slate-400">
                        Loading events...
                    </p>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-400">
                        {error}
                    </div>
                )}

                {/* No events */}
                {!loading && !error && events.length === 0 && (
                    <div className="rounded-xl border border-white/10 bg-slate-900 p-10 text-center">
                        <h2 className="text-xl font-semibold">
                            No events available
                        </h2>

                        <p className="mt-3 text-slate-400">
                            Please check back later for upcoming events.
                        </p>

                        <Link
                            to="/"
                            className="mt-6 inline-block rounded-lg bg-violet-500 px-6 py-3 font-semibold hover:bg-violet-400"
                        >
                            Back to Home    
                        </Link>
                    </div>
                )}

                {/* Event cards */}
                {!loading && !error && events.length > 0 && (
                    <>
                        <p className="mb-6 text-sm text-slate-400">
                            {events.length}{" "}
                            {events.length === 1 ? "event" : "events"} found
                        </p>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <article
                                    key={event._id}
                                    className="group overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition hover:-translate-y-1 hover:border-violet-400/50"
                                >
                                    {/* Event image */}
                                    {event.imageUrl ? (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.title}
                                            loading="lazy"
                                            className="h-52 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-52 items-center justify-center bg-slate-800 text-slate-400">
                                            No event image
                                        </div>
                                    )}

                                    {/* Event information */}
                                    <div className="p-5">
                                        <h2 className="text-xl font-bold">
                                            {event.title}
                                        </h2>

                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                                            {event.description}
                                        </p>

                                        <div className="mt-4 space-y-2 text-sm text-slate-300">
                                            <p>
                                                <span className="text-slate-500">
                                                    Location:
                                                </span>{" "}
                                                {event.location}
                                            </p>

                                            <p>
                                                <span className="text-slate-500">
                                                    Date:
                                                </span>{" "}
                                                {event.date
                                                    ? new Date(
                                                          event.date
                                                      ).toLocaleDateString(
                                                          "en-IN",
                                                          {
                                                              day: "numeric",
                                                              month: "short",
                                                              year: "numeric",
                                                          }
                                                      )
                                                    : "Not specified"}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                                            <p className="text-lg font-bold text-violet-400">
                                                ₹{event.ticketPrice}
                                            </p>

                                            <Link
                                               to={`/events/${event._id}`}
                                                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-violet-500">
                                                   View Details
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

export default Events;
