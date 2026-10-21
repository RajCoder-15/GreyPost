
import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    LogOut,
    UserRound,
    House,
    Search,
    X,
    Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import CreatePostModal from "./CreatePostModal";

function Navbar({ onPostCreated }) {
    const [showModal, setShowModal] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await fetch(
                "http://localhost:3000/notifications/unread-count",
                { credentials: "include" }
            );

            if (!response.ok) return;

            const data = await response.json();
            setUnreadCount(data.count || 0);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    async function handleLogout() {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            const response = await fetch("http://localhost:3000/logout", {
                method: "GET",
                credentials: "include"
            });

            if (response.ok) {
                navigate("/login");
            }
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setLoggingOut(false);
        }
    }

    return (
        <>
            <nav className="relative z-40 w-full max-w-full border-b border-white/[0.07] bg-[#0b0b10]">
                <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-3 px-3 sm:min-h-[72px] sm:px-6">
                    {showSearch ? (
                        <>
                            <div className="min-w-0 flex-1">
                                <SearchBar />
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowSearch(false)}
                                aria-label="Close search"
                                title="Close search"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                            >
                                <X size={21} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="shrink-0 text-lg font-bold tracking-tight text-white transition hover:text-violet-300 sm:text-2xl"
                                aria-label="GreyPost home"
                            >
                                Grey<span className="text-violet-400">Post</span>
                                <span className="text-violet-400">.</span>
                            </button>

                            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSearch(true)}
                                    aria-label="Search users"
                                    title="Search users"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-violet-500/10 hover:text-violet-300 sm:h-10 sm:w-10"
                                >
                                    <Search size={19} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/notifications")}
                                    aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                                    title="Notifications"
                                    className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-violet-500/10 hover:text-violet-300 sm:h-10 sm:w-10"
                                >
                                    <Bell size={19} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#0b0b10] bg-violet-500 px-1 text-[10px] font-bold leading-none text-white">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    aria-label="Home"
                                    title="Home"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-white/[0.06] hover:text-white sm:h-10 sm:w-10"
                                >
                                    <House size={19} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowModal(true)}
                                    aria-label="Create post"
                                    title="Create post"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500 text-white transition hover:bg-violet-400 active:scale-[0.98] sm:h-10 sm:w-auto sm:gap-2 sm:px-4"
                                >
                                    <Plus size={19} />
                                    <span className="hidden text-sm font-medium sm:inline">
                                        Create
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/profile")}
                                    aria-label="Profile"
                                    title="Profile"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-500/[0.08] hover:text-white sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
                                >
                                    <UserRound size={18} />
                                    <span className="hidden text-sm font-medium sm:inline">
                                        Profile
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    title={loggingOut ? "Logging out..." : "Logout"}
                                    aria-label="Logout"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-red-500/[0.08] hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-auto sm:px-3"
                                >
                                    <LogOut size={18} />
                                    <span className="hidden text-sm lg:inline">
                                        {loggingOut ? "Logging out..." : "Logout"}
                                    </span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </nav>

            {showModal && (
                <CreatePostModal
                    onClose={() => setShowModal(false)}
                    onPostCreated={onPostCreated}
                />
            )}
        </>
    );
}

export default Navbar;
