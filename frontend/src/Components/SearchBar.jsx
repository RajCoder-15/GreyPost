
import { useState } from "react";
import {
    Search,
    UserRound,
    LoaderCircle,
    AlertCircle,
    Users,
    ArrowUpRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        const query = search.trim();

        if (!query) {
            setUsers([]);
            setError("");
            setHasSearched(false);
            setLoading(false);
            return;
        }

        setUsers([]);
        setLoading(true);
        setError("");
        setHasSearched(true);

        try {
            const response = await fetch(
                `http://localhost:3000/search?q=${encodeURIComponent(query)}`,
                { credentials: "include" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Search failed.");
            }

            const results = Array.isArray(data)
                ? data
                : Array.isArray(data.users)
                    ? data.users
                    : [];

            setUsers(results);
        } catch (err) {
            setError(err.message || "Something went wrong.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    function handleInputChange(e) {
        setSearch(e.target.value);
        setHasSearched(false);
        setError("");
        setUsers([]);
    }

    function getProfileImage(user) {
        if (!user.profilepic || user.profilepic === "default.webp") {
            return null;
        }

        return user.profilepic.startsWith("http")
            ? user.profilepic
            : `http://localhost:3000/${user.profilepic.replace(/^\/+/, "")}`;
    }

    function openProfile(username) {
        setSearch("");
        setUsers([]);
        setError("");
        setHasSearched(false);

        navigate(`/profile/${encodeURIComponent(username)}`);
    }

    const showResults = loading || error || users.length > 0 ||
        (hasSearched && !loading);

    return (
        <div className="relative w-full min-w-0">
            <form
                onSubmit={handleSubmit}
                className="flex w-full min-w-0 items-center gap-1"
            >
                <div className="relative min-w-0 flex-1">
                    <Search
                        size={17}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />

                    <input
                        type="search"
                        placeholder="Search users..."
                        value={search}
                        onChange={handleInputChange}
                        autoComplete="off"
                        aria-label="Search users"
                        className="w-full min-w-0 rounded-full border border-white/[0.08] bg-[#111113] py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500/60 focus:bg-[#151419] focus:ring-2 focus:ring-violet-500/10 sm:pl-10 sm:pr-4"
                    />
                </div>

                <button
                    type="submit"
                    aria-label="Search users"
                    disabled={loading || !search.trim()}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-300 transition hover:bg-violet-500/10 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                        <Search size={18} />
                    )}
                </button>
            </form>

            {showResults && (
                <div className="absolute left-0 top-full z-50 mt-2 max-h-80 w-full min-w-[250px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111113] shadow-2xl shadow-black/50">
                    <div className="flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
                        <Users size={15} className="text-violet-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            {loading ? "Searching" : error ? "Search error" : "People"}
                        </span>

                        {!loading && !error && users.length > 0 && (
                            <span className="ml-auto rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-300">
                                {users.length}
                            </span>
                        )}
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {loading && (
                            <div className="flex items-center justify-center gap-3 px-4 py-8 text-sm text-zinc-400">
                                <LoaderCircle size={18} className="animate-spin text-violet-400" />
                                Finding people...
                            </div>
                        )}

                        {error && (
                            <div role="alert" className="flex items-start gap-3 px-4 py-5">
                                <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                                <p className="text-sm leading-5 text-red-300">
                                    {error}
                                </p>
                            </div>
                        )}

                        {!loading && !error && users.length > 0 && (
                            <div className="p-1.5">
                                {users.map((user) => {
                                    const profileImage = getProfileImage(user);

                                    return (
                                        <button
                                            key={user._id}
                                            type="button"
                                            onClick={() => openProfile(user.username)}
                                            className="group flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-violet-500/[0.08]"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-zinc-800 transition group-hover:border-violet-400/30">
                                                {profileImage ? (
                                                    <img
                                                        src={profileImage}
                                                        alt={user.username || "User"}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <UserRound
                                                        size={20}
                                                        className="text-zinc-400 transition group-hover:text-violet-300"
                                                    />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-zinc-100 transition group-hover:text-violet-300">
                                                    {user.name || user.username}
                                                </p>
                                                <p className="mt-0.5 truncate text-xs text-zinc-500">
                                                    @{user.username}
                                                </p>
                                            </div>

                                            <ArrowUpRight
                                                size={16}
                                                className="shrink-0 text-zinc-600 opacity-0 transition group-hover:translate-x-0.5 group-hover:text-violet-300 group-hover:opacity-100"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {!loading && !error && hasSearched && users.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400">
                                    <Users size={20} />
                                </div>
                                <p className="mt-3 text-sm font-medium text-zinc-200">
                                    No users found
                                </p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    Try another name or username.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchBar;
