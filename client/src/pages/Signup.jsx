import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState("register");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/auth/register", {
                name,
                email,
                password,
            });

            setMessage(
                response.data.message ||
                    "Registration successful. Check your email for the OTP."
            );

            setStep("verify");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/auth/verify-otp", {
                email,
                otp,
            });

            const data = response.data;

            if (data.token) {
                localStorage.setItem("token", data.token);

                const user = data.user || {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                };

                localStorage.setItem("user", JSON.stringify(user));
                navigate("/");
            } else {
                setMessage(
                    data.message || "Email verified successfully. Please log in."
                );
                setStep("verified");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "OTP verification failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8">
                <h1 className="text-3xl font-bold">
                    {step === "register"
                        ? "Create Account"
                        : step === "verify"
                          ? "Verify Your Email"
                          : "Email Verified"}
                </h1>

                <p className="mt-2 text-slate-400">
                    {step === "register"
                        ? "Join Eventora and discover upcoming events."
                        : step === "verify"
                          ? `Enter the OTP sent to ${email}.`
                          : "Your email has been verified successfully."}
                </p>

                {message && (
                    <p className="mt-5 rounded-lg bg-green-500/10 p-3 text-sm text-green-400">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="mt-5 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                        {error}
                    </p>
                )}

                {step === "register" && (
                    <form
                        onSubmit={handleRegister}
                        className="mt-7 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium"
                            >
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-violet-400"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-violet-400"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                required
                                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-violet-400"
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-violet-500 px-5 py-3 font-semibold transition hover:bg-violet-400 disabled:opacity-60"
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>
                    </form>
                )}

                {step === "verify" && (
                    <form
                        onSubmit={handleVerifyOtp}
                        className="mt-7 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="otp"
                                className="mb-2 block text-sm font-medium"
                            >
                                Email OTP
                            </label>

                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 outline-none focus:border-violet-400"
                                placeholder="Enter the OTP from your email"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-violet-500 px-5 py-3 font-semibold transition hover:bg-violet-400 disabled:opacity-60"
                        >
                            {loading ? "Verifying..." : "Verify Email"}
                        </button>
                    </form>
                )}

                {step === "verified" && (
                    <button
                        onClick={() => navigate("/login")}
                        className="mt-7 w-full rounded-lg bg-violet-500 px-5 py-3 font-semibold hover:bg-violet-400"
                    >
                        Go to Login
                    </button>
                )}

                {step === "register" && (
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-violet-400 hover:text-violet-300"
                        >
                            Log in
                        </Link>
                    </p>
                )}
            </div>
        </main>
    );
}

export default Signup;
