
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, UserRound } from "lucide-react";

function FollowList() {
    const location = useLocation();

    const type = location.pathname.endsWith("/followers")
        ? "followers"
        : location.pathname.endsWith("/following")
        ? "following"
        : "";
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function fetchFollowList() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    "http://localhost:3000/profile",
                    { credentials: "include" }
                );

                if (response.status === 401) {
                    navigate("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to load follow list.");
                }

                const data = await response.json();

                if (!data.user) {
                    throw new Error("Profile not found.");
                }

                const list =
                    type === "followers"
                        ? data.user.followers
                        : data.user.following;

                if (active) {
                    setUsers(Array.isArray(list) ? list : []);
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

        if (type === "followers" || type === "following") {
            fetchFollowList();
        } else {
            setError("Invalid list type.");
            setLoading(false);
        }

        return () => {
            active = false;
        };
    }, [type, navigate]);

    const title =
        type === "followers" ? "Followers" : "Following";

    return (
        <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
            <section className="mx-auto max-w-2xl">

                <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="mb-6 flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
                >
                    <ArrowLeft size={18} />
                    Back to Profile
                </button>

                <h1 className="mb-6 text-2xl font-bold">
                    {title}
                </h1>

                {loading ? (
                    <p className="text-zinc-400">
                        Loading {title.toLowerCase()}...
                    </p>
                ) : error ? (
                    <p className="text-red-400">{error}</p>
                ) : users.length === 0 ? (
                    <div className="rounded-xl border border-zinc-800 p-8 text-center">
                        <UserRound
                            size={36}
                            className="mx-auto mb-3 text-zinc-500"
                        />
                        <p className="font-medium">
                            No {title.toLowerCase()} yet
                        </p>
                        <p className="mt-2 text-sm text-zinc-400">
                            This list will appear here when users connect.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {users.map((user) => (
                            <button
                                key={user._id}
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/profile/${encodeURIComponent(user.username)}`
                                    )
                                }
                                className="flex w-full items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:bg-zinc-800"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-700">
                                    {user.profilepic &&
                                    user.profilepic !== "default.webp" ? (
                                        <img
                                            src={
                                                user.profilepic.startsWith("http")
                                                    ? user.profilepic
                                                    : `http://localhost:3000/${user.profilepic.replace(/^\/+/, "")}`
                                            }
                                            alt={user.username}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <UserRound
                                            size={24}
                                            className="text-zinc-300"
                                        />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate font-semibold">
                                        {user.name || user.username}
                                    </p>
                                    <p className="truncate text-sm text-zinc-400">
                                        @{user.username}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default FollowList;
