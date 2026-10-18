
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
        <div className="relative w-80">
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2"
            >
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-full bg-zinc-800 text-white outline-none"
                />

                <button
                    type="submit"
                    aria-label="Search users"
                    className="p-2 rounded-full hover:bg-zinc-700 text-white"
                >
                    <Search size={20} />
                </button>
            </form>

            {(loading || error || users.length > 0 ||
                (hasSearched && !loading)) && (
                <div className="absolute top-full left-0 mt-2 w-full rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl z-50 overflow-hidden">

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
                                className="w-full flex flex-col items-start px-4 py-3 hover:bg-zinc-700 text-left"
                            >
                                <span className="text-white font-medium">
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
