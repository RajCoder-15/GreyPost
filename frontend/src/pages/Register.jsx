
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareText, LoaderCircle, AlertCircle } from "lucide-react";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    name,
                    username,
                    email,
                    age,
                    password
                })
            });

            if (response.ok) {
                navigate("/");
            } else {
                const message = await response.text();
                setError(message || "Unable to create your account. Please try again.");
            }
        } catch {
            setError("Unable to connect to the server. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-10 text-white">
            <div className="w-full max-w-md">
                <div className="mb-7 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                        <MessageSquareText size={27} strokeWidth={1.8} />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">
                        Grey<span className="text-violet-400">Post</span>
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        Your space, your voice.
                    </p>
                </div>

                <section className="rounded-2xl border border-white/[0.08] bg-[#111113] p-6 shadow-2xl shadow-black/30 sm:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Create your account
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Get started with GreyPost.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="register-name" className="text-sm font-medium text-zinc-300">
                                Full name
                            </label>
                            <input
                                id="register-name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                required
                                className="w-full rounded-xl border border-zinc-800 bg-[#0b0b0d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="register-username" className="text-sm font-medium text-zinc-300">
                                Username
                            </label>
                            <input
                                id="register-username"
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                                className="w-full rounded-xl border border-zinc-800 bg-[#0b0b0d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="register-email" className="text-sm font-medium text-zinc-300">
                                Email address
                            </label>
                            <input
                                id="register-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                                className="w-full rounded-xl border border-zinc-800 bg-[#0b0b0d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="register-age" className="text-sm font-medium text-zinc-300">
                                Age
                            </label>
                            <input
                                id="register-age"
                                type="number"
                                placeholder="Enter your age"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                min="1"
                                required
                                className="w-full rounded-xl border border-zinc-800 bg-[#0b0b0d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="register-password" className="text-sm font-medium text-zinc-300">
                                Password
                            </label>
                            <input
                                id="register-password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                required
                                className="w-full rounded-xl border border-zinc-800 bg-[#0b0b0d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
                            />
                        </div>

                        {error && (
                            <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-3 text-sm text-red-300">
                                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && <LoaderCircle size={18} className="animate-spin" />}
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <div className="my-6 border-t border-white/[0.07]" />

                    <p className="text-center text-sm text-zinc-400">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="font-semibold text-violet-400 transition hover:text-violet-300"
                        >
                            Log in
                        </button>
                    </p>
                </section>

                <p className="mt-6 text-center text-xs text-zinc-600">
                    GREYPOST · YOUR SPACE, YOUR VOICE
                </p>
            </div>
        </main>
    );
}

export default Register;
