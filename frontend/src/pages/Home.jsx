
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, LoaderCircle, Users } from "lucide-react";
import Navbar from "../Components/Navbar";
import PostCard from "../Components/PostCard";

function Home() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [followingIds, setFollowingIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFeed = useCallback(async () => {
        try {
            setError("");

            const response = await fetch(
                "http://localhost:3000/getFeed",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load feed"
                );
            }

            setPosts(data.posts || []);
            setCurrentUserId(String(data.currentUserId));
            setFollowingIds(
                (data.following || []).map((id) => String(id))
            );
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0b10] text-white flex flex-col items-center justify-center gap-4">
                <LoaderCircle className="h-7 w-7 animate-spin text-violet-400" />

                <p className="text-sm text-zinc-400">
                    Loading GreyPost...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0b10] text-zinc-100">
            <Navbar onPostCreated={fetchFeed} />

            <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
                {error && (
                    <div
                        role="alert"
                        className="mx-auto mb-6 flex max-w-2xl items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-300"
                    >
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div>
                            <p className="font-medium">
                                Couldn't load your feed
                            </p>

                            <p className="mt-1 text-red-300/80">
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

                {!error && posts.length === 0 && (
                    <div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.07] bg-[#121218] px-5 py-12 text-center sm:py-16">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                            <Users className="h-7 w-7 text-violet-300" />
                        </div>

                        <h2 className="mt-5 text-lg font-semibold text-white">
                            Your feed is waiting
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                            Follow people to discover their posts, or
                            create your first post to get the conversation
                            started.
                        </p>
                    </div>
                )}

                {!error && posts.length > 0 && (
                    <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 sm:gap-6">
                        {posts.map((post) => {
                            const authorId = String(
                                post.user?._id || ""
                            );

                            return (
                                <PostCard
                                    key={post._id}
                                    postId={post._id}
                                    username={
                                        post.user?.username ||
                                        post.user?.name ||
                                        "Unknown User"
                                    }
                                    userId={authorId}
                                    currentUserId={currentUserId}
                                    image={
                                        post.image
                                            ? `http://localhost:3000${post.image}`
                                            : ""
                                    }
                                    caption={post.content}
                                    likes={post.likes || []}
                                    isFollowing={followingIds.includes(
                                        authorId
                                    )}
                                />
                            );
                        })}
                    </section>
                )}

                <footer className="mx-auto mt-12 max-w-2xl border-t border-white/[0.06] py-5 text-center">
                    <p className="text-xs tracking-wide text-zinc-600">
                        GREYPOST{" "}
                        <span className="text-violet-400">·</span>{" "}
                        YOUR SPACE, YOUR VOICE
                    </p>
                </footer>
            </main>
        </div>
    );
}

export default Home;
