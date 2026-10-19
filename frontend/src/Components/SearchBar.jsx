
import { useState } from "react";
import { Search } from "lucide-react";
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
                throw new Error(data.message || "Search failed");
            }

            const results = Array.isArray(data)
                ? data
                : Array.isArray(data.users)
                    ? data.users
                    : [];

            setUsers(results);
        } catch (err) {
            setError(err.message || "Something went wrong");
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

    function openProfile(username) {
        setSearch("");
        setUsers([]);
        setError("");
        setHasSearched(false);

        navigate(`/profile/${encodeURIComponent(username)}`);
    }

    return (
        <div className="relative w-full min-w-0">
            <form
                onSubmit={handleSubmit}
                className="flex w-full min-w-0 items-center"
            >
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={handleInputChange}
                    className="w-full min-w-0 rounded-full border border-white/[0.08] bg-zinc-800 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-400 focus:border-violet-400/50 sm:px-4"
                />

                <button
                    type="submit"
                    aria-label="Search users"
                    className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-zinc-700"
                >
                    <Search size={18} />
                </button>
            </form>

            {(loading || error || users.length > 0 ||
                (hasSearched && !loading)) && (
                <div className="absolute left-0 top-full z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl">
                    {loading && (
                        <p className="p-3 text-sm text-zinc-400">
                            Searching...
                        </p>
                    )}

                    {error && (
                        <p className="p-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    {!loading && !error && users.length > 0 &&
                        users.map((user) => (
                            <button
                                key={user._id}
                                type="button"
                                onClick={() => openProfile(user.username)}
                                className="flex w-full flex-col items-start px-4 py-3 text-left transition hover:bg-zinc-700"
                            >
                                <span className="font-medium text-white">
                                    {user.name || user.username}
                                </span>

                                <span className="text-sm text-zinc-400">
                                    @{user.username}
                                </span>
                            </button>
                        ))}

                    {!loading && !error && hasSearched &&
                        users.length === 0 && (
                        <p className="p-3 text-sm text-zinc-400">
                            No users found.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;
