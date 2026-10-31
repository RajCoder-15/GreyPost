
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle,
    LoaderCircle,
    Users,
    Compass,
    Newspaper
} from "lucide-react";
import Navbar from "../Components/Navbar";
import PostCard from "../Components/PostCard";

function Home() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [followingIds, setFollowingIds] = useState([]);
    const [activeTab, setActiveTab] = useState("following");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFeed = useCallback(async () => {
        try {
            setError("");

            const response = await fetch("http://localhost:3000/getFeed", {
                method: "GET",
                credentials: "include"
            });

            if (response.status === 401 || response.status === 403) {
                navigate("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load feed");
            }

            setPosts(data.posts || []);
            setCurrentUserId(String(data.currentUserId || ""));
            setFollowingIds((data.following || []).map((id) => String(id)));
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const followingPosts = useMemo(() => {
        return posts.filter((post) => {
            const authorId = String(post.user?._id || "");

            return (
                authorId === currentUserId ||
                followingIds.includes(authorId)
            );
        });
    }, [posts, currentUserId, followingIds]);

    const explorePosts = useMemo(() => {
        return posts.filter((post) => {
            const authorId = String(post.user?._id || "");

            return (
                authorId !== currentUserId &&
                !followingIds.includes(authorId)
            );
        });
    }, [posts, currentUserId, followingIds]);

    const visiblePosts =
        activeTab === "following" ? followingPosts : explorePosts;

    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 overflow-x-hidden bg-[#0b0b10] px-4 text-white">
                <LoaderCircle className="h-7 w-7 animate-spin text-violet-400" />
                <p className="text-sm text-zinc-400">Loading GreyPost...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-clip bg-[#0b0b10] text-zinc-100">
            <Navbar onPostCreated={fetchFeed} />

            <main className="mx-auto box-border w-full min-w-0 max-w-7xl px-3 py-5 sm:px-6 sm:py-7">

                {error && (
                    <div
                        role="alert"
                        className="mx-auto mb-6 flex w-full min-w-0 max-w-2xl items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-3 text-sm text-red-300 sm:p-4"
                    >
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div className="min-w-0 flex-1">
                            <p className="font-medium">
                                Couldn't load your feed
                            </p>

                            <p className="mt-1 break-words text-red-300/80">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setLoading(true);
                                    fetchFeed();
                                }}
                                className="mt-3 rounded-lg border border-red-400/20 px-3 py-1.5 font-medium transition hover:bg-red-400/10"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {!error && (
                    <section className="mx-auto w-full max-w-2xl">

                        <div className="mb-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                                Your community
                            </p>

                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Your Feed
                            </h1>

                            <p className="mt-1 text-sm text-zinc-500">
                                Discover what's happening on GreyPost.
                            </p>
                        </div>

                        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.07] bg-[#121218] p-1.5">

                            <button
                                type="button"
                                onClick={() => setActiveTab("following")}
                                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                                    activeTab === "following"
                                        ? "bg-violet-500 text-white shadow-lg shadow-violet-950/30"
                                        : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                                }`}
                            >
                                <Users size={17} />
                                Following
                                <span className={`rounded-full px-2 py-0.5 text-xs ${
                                    activeTab === "following"
                                        ? "bg-white/20 text-white"
                                        : "bg-white/[0.07] text-zinc-400"
                                }`}>
                                    {followingPosts.length}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("explore")}
                                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                                    activeTab === "explore"
                                        ? "bg-violet-500 text-white shadow-lg shadow-violet-950/30"
                                        : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                                }`}
                            >
                                <Compass size={17} />
                                Explore
                                <span className={`rounded-full px-2 py-0.5 text-xs ${
                                    activeTab === "explore"
                                        ? "bg-white/20 text-white"
                                        : "bg-white/[0.07] text-zinc-400"
                                }`}>
                                    {explorePosts.length}
                                </span>
                            </button>

                        </div>

                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {activeTab === "following"
                                        ? "Following"
                                        : "Explore"}
                                </h2>

                                <p className="mt-1 text-xs text-zinc-500">
                                    {activeTab === "following"
                                        ? "Posts from you and people you follow"
                                        : "Discover posts from other people"}
                                </p>
                            </div>

                            <span className="text-xs text-zinc-500">
                                {visiblePosts.length} posts
                            </span>
                        </div>

                        {visiblePosts.length > 0 ? (
                            <div className="flex w-full min-w-0 flex-col gap-5 sm:gap-6">
                                {visiblePosts.map((post) => {
                                    const authorId = String(
                                        post.user?._id || ""
                                    );

                                    return (
                                        <div
                                            key={post._id}
                                            className="w-full min-w-0 max-w-full"
                                        >
                                            <PostCard
                                                postId={post._id}
                                                username={
                                                    post.user?.username ||
                                                    post.user?.name ||
                                                    "Unknown User"
                                                }
                                                userId={authorId}
                                                profilepic={post.user?.profilepic}
                                                currentUserId={currentUserId}
                                                image={
                                                    post.image
                                                        ? `http://localhost:3000${post.image}`
                                                        : ""
                                                }
                                                caption={post.content || ""}
                                                likes={post.likes || []}
                                                isFollowing={followingIds.includes(authorId)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-[#121218] px-4 py-14 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                                    {activeTab === "following" ? (
                                        <Users className="h-7 w-7 text-violet-300" />
                                    ) : (
                                        <Newspaper className="h-7 w-7 text-violet-300" />
                                    )}
                                </div>

                                <h3 className="mt-5 text-lg font-semibold text-white">
                                    {activeTab === "following"
                                        ? "Nothing here yet"
                                        : "No posts to explore"}
                                </h3>

                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                                    {activeTab === "following"
                                        ? "Follow people or create your first post to see something here."
                                        : "There are no posts from other users yet. Check back later."}
                                </p>

                                {activeTab === "following" && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("explore")}
                                        className="mt-5 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
                                    >
                                        Explore posts
                                    </button>
                                )}
                            </div>
                        )}

                    </section>
                )}

                <footer className="mx-auto mt-12 w-full min-w-0 max-w-2xl border-t border-white/[0.06] py-5 text-center">
                    <p className="break-words text-xs tracking-wide text-zinc-600">
                        GREYPOST <span className="text-violet-400">·</span> YOUR SPACE, YOUR VOICE
                    </p>
                </footer>

            </main>
        </div>
    );
}

export default Home;
