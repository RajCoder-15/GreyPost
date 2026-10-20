
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    ArrowLeft,
    UserRound,
    Users,
    UserCheck,
    LoaderCircle,
    AlertCircle,
    RefreshCw,
    ChevronRight
} from "lucide-react";

function FollowList() {
    const location = useLocation();
    const navigate = useNavigate();

    const type = location.pathname.endsWith("/followers")
        ? "followers"
        : location.pathname.endsWith("/following")
        ? "following"
        : "";

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [retryCount, setRetryCount] = useState(0);

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

                if (response.status === 401 || response.status === 403) {
                    navigate("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Failed to load this list.");
                }

                const data = await response.json();

                if (!data.user) {
                    throw new Error("Profile not found.");
                }

                const list = type === "followers"
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
    }, [type, navigate, retryCount]);

    const isFollowers = type === "followers";
    const title = isFollowers ? "Followers" : "Following";
    const Icon = isFollowers ? Users : UserCheck;

    function getProfileImage(user) {
        if (!user.profilepic || user.profilepic === "default.webp") {
            return null;
        }

        return user.profilepic.startsWith("http")
            ? user.profilepic
            : `http://localhost:3000/${user.profilepic.replace(/^\/+/, "")}`;
    }

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#09090b] px-4 py-8 text-white sm:py-12">
            <section className="mx-auto w-full max-w-2xl">
                <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="mb-7 inline-flex items-center gap-2 rounded-lg text-sm text-zinc-400 transition hover:text-white"
                >
                    <ArrowLeft size={18} />
                    Back to Profile
                </button>

                <div className="mb-7 rounded-2xl border border-white/[0.08] bg-[#111113] p-5 sm:p-7">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                            <Icon size={24} strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                {title}
                            </h1>
                            <p className="mt-1 text-sm text-zinc-400">
                                {isFollowers
                                    ? "People who follow your profile"
                                    : "People you're connected with"}
                            </p>
                        </div>

                        {!loading && !error && (
                            <div className="shrink-0 rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2">
                                <span className="text-sm font-semibold tabular-nums text-violet-300">
                                    {users.length}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-300">
                        {isFollowers ? "Your followers" : "Following"}
                    </h2>
                    {!loading && !error && users.length > 0 && (
                        <span className="text-xs text-zinc-500">
                            {users.length} {users.length === 1 ? "person" : "people"}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111113] px-6 py-16">
                        <LoaderCircle size={28} className="animate-spin text-violet-400" />
                        <p className="mt-4 text-sm text-zinc-400">
                            Loading {title.toLowerCase()}...
                        </p>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-[#111113] px-6 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                            <AlertCircle size={24} />
                        </div>
                        <p className="mt-4 font-medium text-white">
                            Couldn't load the list
                        </p>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={() => setRetryCount((count) => count + 1)}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                        >
                            <RefreshCw size={16} />
                            Try again
                        </button>
                    </div>
                ) : users.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111113] px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                            <UserRound size={27} strokeWidth={1.7} />
                        </div>
                        <h3 className="mt-5 text-lg font-semibold">
                            No {title.toLowerCase()} yet
                        </h3>
                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-zinc-400">
                            {isFollowers
                                ? "When people follow your profile, they'll appear here."
                                : "People you follow will appear here."}
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="mt-6 rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/15"
                        >
                            Explore GreyPost
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111113]">
                        {users.map((user, index) => {
                            const profileImage = getProfileImage(user);

                            return (
                                <button
                                    key={user._id}
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            `/profile/${encodeURIComponent(user.username)}`
                                        )
                                    }
                                    className={`group flex w-full min-w-0 items-center gap-3 px-4 py-4 text-left transition hover:bg-violet-500/[0.06] sm:gap-4 sm:px-5 ${
                                        index !== users.length - 1
                                            ? "border-b border-white/[0.06]"
                                            : ""
                                    }`}
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-zinc-800">
                                        {profileImage ? (
                                            <img
                                                src={profileImage}
                                                alt={user.username || "User"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <UserRound
                                                size={23}
                                                className="text-zinc-400"
                                            />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-zinc-100 transition group-hover:text-violet-300 sm:text-base">
                                            {user.name || user.username}
                                        </p>
                                        <p className="mt-1 truncate text-sm text-zinc-500">
                                            @{user.username}
                                        </p>
                                    </div>

                                    <ChevronRight
                                        size={19}
                                        className="shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-violet-400"
                                    />
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default FollowList;
