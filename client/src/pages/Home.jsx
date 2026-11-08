
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEvents } from "../services/eventService.js";

function Home() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
    try {
        const eventList = await getEvents();
        setEvents(eventList.slice(0, 3));
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
        <main className="min-h-screen bg-slate-950 text-white">
            {/* Hero section */}
            <section className="px-6 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl text-center">
                    <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                        Discover experiences. Create memories.
                    </p>

                    <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
                        Find Your Next
                        <br />
                        <span className="text-violet-400">
                            Unforgettable Event
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                        From live music and technology meetups to art and
                        entertainment, discover events worth showing up for.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Link
                            to="/events"
                            className="rounded-lg bg-violet-500 px-7 py-3 font-semibold transition hover:bg-violet-400"
                        >
                            Explore Events
                        </Link>

                        <Link
                            to="/signup"
                            className="rounded-lg border border-white/20 px-7 py-3 font-semibold transition hover:bg-white/10"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured events section */}
            <section className="px-6 pb-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-400">
                                Don't miss out
                            </p>

                            <h2 className="text-3xl font-bold">
                                Upcoming Events
                            </h2>

                            <p className="mt-2 text-slate-400">
                                Discover what's happening next.
                            </p>
                        </div>

                        <Link
                            to="/events"
                            className="font-medium text-violet-400 transition hover:text-violet-300"
                        >
                            View all events →
                        </Link>
                    </div>

                    {loading && (
                        <p className="py-10 text-center text-slate-400">
                            Loading events...
                        </p>
                    )}

                    {!loading && error && (
                        <p className="py-10 text-center text-red-400">
                            {error}
                        </p>
                    )}

                    {!loading && !error && events.length === 0 && (
                        <div className="rounded-xl border border-white/10 bg-slate-900 p-10 text-center">
                            <h3 className="text-xl font-semibold">
                                No events yet
                            </h3>

                            <p className="mt-2 text-slate-400">
                                Check back soon for upcoming events.
                            </p>
                        </div>
                    )}

                    {!loading && !error && events.length > 0 && (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <article
                                    key={event._id}
                                    className="group overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition hover:-translate-y-1 hover:border-violet-400/50"
                                >
                                    {event.imageUrl ? (
                                        <img
                                            src={event.imageUrl}
                                            alt={event.title}
                                            loading="lazy"
                                            className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-52 items-center justify-center bg-slate-800 text-slate-400">
                                            No event image
                                        </div>
                                    )}

                                    <div className="p-5">
                                        <h3 className="text-xl font-bold">
                                            {event.title}
                                        </h3>

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
                                                   className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-violet-500" >
                                                     View Details
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Call to action */}
            <section className="border-t border-white/10 bg-slate-900/60 px-6 py-16">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold">
                        Your Next Experience Starts Here
                    </h2>

                    <p className="mt-4 leading-7 text-slate-400">
                        Explore upcoming events and find something you love.
                    </p>

                    <Link
                        to="/events"
                        className="mt-7 inline-block rounded-lg bg-violet-500 px-7 py-3 font-semibold transition hover:bg-violet-400"
                    >
                        Browse All Events
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default Home;
