
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

function EditProfile() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        async function loadProfile() {
            try {
                const response = await fetch(
                    "http://localhost:3000/profile",
                    { credentials: "include" }
                );

                if (response.status === 401 || response.status === 403) {
                    navigate("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Could not load profile.");
                }

                const data = await response.json();
                const user = data.user;

                if (!user) {
                    throw new Error("Profile data not found.");
                }

                if (active) {
                    setName(user.name || "");
                    setUsername(user.username || "");
                    setBio(user.bio || "");
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            active = false;
        };
    }, [navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name.trim() || !username.trim()) {
            setError("Name and username are required.");
            return;
        }

        if (bio.length > 160) {
            setError("Bio cannot exceed 160 characters.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                "http://localhost:3000/profile",
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        username,
                        bio,
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (response.status === 401 || response.status === 403) {
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update profile."
                );
            }

            setSuccess("Profile updated successfully!");

            // Navigate after a successful database update.
            navigate("/profile");
        } catch (err) {
            setError(err.message || "Could not save profile.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 p-8 text-center text-zinc-300">
                Loading profile...
            </div>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-white">
            <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">

                <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="mb-6 flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
                >
                    <ArrowLeft size={16} />
                    Back to Profile
                </button>

                <h1 className="mb-2 text-2xl font-bold">
                    Edit Profile
                </h1>

                <p className="mb-6 text-sm text-zinc-400">
                    Update your name, username and bio.
                </p>

                {error && (
                    <p className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="mb-4 rounded-lg border border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-300">
                        {success}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm text-zinc-300"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={80}
                            required
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="username"
                            className="mb-2 block text-sm text-zinc-300"
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={30}
                            required
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label
                                htmlFor="bio"
                                className="text-sm text-zinc-300"
                            >
                                Bio
                            </label>

                            <span className="text-xs text-zinc-500">
                                {bio.length}/160
                            </span>
                        </div>

                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={160}
                            rows={4}
                            placeholder="Tell people a little about yourself..."
                            className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 outline-none focus:border-zinc-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save size={17} />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                </form>
            </div>
        </main>
    );
}

export default EditProfile;
