
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle,
    LoaderCircle,
    Newspaper
} from "lucide-react";
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
            setFollowingIds((data.following || []).map(id => String(id)));
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
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFF8F1] text-[#49352D]">
                <LoaderCircle className="h-8 w-8 animate-spin text-[#D97757]" />
                <p className="text-sm text-[#987B6D]">Loading GreyPost...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full overflow-x-clip bg-[#FFF8F1] text-[#49352D]">
            <Navbar onPostCreated={fetchFeed} />

            <main className="mx-auto w-full max-w-2xl px-3 py-7 sm:px-6 sm:py-9">

                <div className="mb-7 flex items-center justify-between border-b border-[#F0DED3] pb-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#49352D] sm:text-3xl">
                            Home
                        </h1>
                        <p className="mt-1 text-sm text-[#A48B7E]">
                            What's happening today?
                        </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F0D8C9] bg-[#FCE9DC] text-[#D97757]">
                        <Newspaper size={21} />
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-start gap-3 rounded-2xl border border-[#E9B9A9] bg-[#FFF0EB] p-4 text-sm text-[#A94F3D]"
                    >
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div className="min-w-0 flex-1">
                            <p className="font-semibold">Couldn't load your feed</p>
                            <p className="mt-1 text-[#B66B5A]">{error}</p>

                            <button
                                type="button"
                                onClick={() => {
                                    setLoading(true);
                                    fetchFeed();
                                }}
                                className="mt-3 rounded-lg border border-[#D99C89] px-3 py-1.5 font-semibold transition hover:bg-[#FCE0D6]"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {!error && posts.length > 0 && (
                    <div className="flex flex-col gap-5 sm:gap-6">
                        {posts.map(post => {
                            const authorId = String(post.user?._id || "");

                            return (
                                <PostCard
                                    key={post._id}
                                    postId={post._id}
                                    title={post.title || "Untitled article"}
                                    category={post.category || "Personal"}
                                    date={post.date}
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
                            );
                        })}
                    </div>
                )}

                {!error && posts.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-[#E8CCBA] bg-[#FFFDF9] px-5 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FCE9DC] text-[#D97757]">
                            <Newspaper size={25} />
                        </div>

                        <h2 className="mt-5 text-lg font-bold text-[#49352D]">
                            No posts yet
                        </h2>

                        <p className="mt-2 text-sm text-[#A48B7E]">
                            Be the first to share something with your community.
                        </p>
                    </div>
                )}

                <footer className="mt-12 border-t border-[#F0DED3] py-6 text-center">
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#B49A8B]">
                        GREYPOST <span className="text-[#D97757]">·</span> YOUR SPACE, YOUR VOICE
                    </p>
                </footer>

            </main>
        </div>
    );
}

export default Home;
