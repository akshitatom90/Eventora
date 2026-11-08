
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    const linkStyle = ({ isActive }) =>
        `transition ${
            isActive
                ? "text-violet-400"
                : "text-slate-300 hover:text-white"
        }`;

    return (
        <nav className="border-b border-white/10 bg-slate-950 px-6 py-4 text-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
                <Link to="/" className="text-2xl font-extrabold">
                    Event<span className="text-violet-400">ora</span>
                </Link>

                <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
                    <NavLink to="/" className={linkStyle}>
                        Home
                    </NavLink>

                    <NavLink to="/events" className={linkStyle}>
                        Explore Events
                    </NavLink>

                    {token && user ? (
                        <>
                            {user.role === "admin" ? (
                                <NavLink
                                    to="/admin"
                                    className={linkStyle}
                                >
                                    Admin Dashboard
                                </NavLink>
                            ) : (
                                <NavLink
                                    to="/dashboard"
                                    className={linkStyle}
                                >
                                    Dashboard
                                </NavLink>
                            )}

                            <button
                                onClick={handleLogout}
                                className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={linkStyle}>
                                Log In
                            </NavLink>

                            <Link
                                to="/signup"
                                className="rounded-lg bg-violet-600 px-4 py-2 hover:bg-violet-500"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
