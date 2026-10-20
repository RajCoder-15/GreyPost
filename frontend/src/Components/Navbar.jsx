
import { useState } from "react";
import {
    Plus,
    LogOut,
    UserRound,
    House,
    Search,
    X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import CreatePostModal from "./CreatePostModal";

function Navbar({ onPostCreated }) {
    const [showModal, setShowModal] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();

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
                <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-2 px-2.5 sm:min-h-[72px] sm:gap-3 sm:px-6">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="shrink-0 text-lg font-bold tracking-tight text-white transition hover:text-violet-300 sm:text-2xl"
                        aria-label="GreyPost home"
                    >
                        Grey<span className="text-violet-400">Post</span>
                        <span className="text-violet-400">.</span>
                    </button>

                    <div className="ml-auto flex min-w-0 shrink-0 items-center gap-0.5 sm:gap-2">
                        <button
                            type="button"
                            onClick={() => setShowSearch((prev) => !prev)}
                            aria-label={showSearch ? "Close search" : "Search users"}
                            aria-expanded={showSearch}
                            title="Search users"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-violet-500/10 hover:text-violet-300 sm:h-10 sm:w-10"
                        >
                            {showSearch ? <X size={19} /> : <Search size={19} />}
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
                            <span className="hidden text-sm font-medium sm:inline">Create</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            aria-label="Profile"
                            title="Profile"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-500/[0.08] hover:text-white sm:h-10 sm:w-auto sm:gap-2 sm:px-3"
                        >
                            <UserRound size={18} />
                            <span className="hidden text-sm font-medium sm:inline">Profile</span>
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
                </div>

                {showSearch && (
                    <div className="absolute left-0 right-0 top-full z-50 border-b border-white/[0.07] bg-[#0b0b10] px-3 py-3 shadow-xl shadow-black/30 sm:left-auto sm:right-6 sm:w-[min(24rem,calc(100vw-2rem))] sm:rounded-b-2xl sm:border sm:border-t-0 sm:px-4">
                        <SearchBar />
                    </div>
                )}
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
