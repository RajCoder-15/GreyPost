import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
                    credentials: "include"
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
                (data.following || []).map(id => String(id))
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
            <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
                Loading GreyPost...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white">
            <Navbar onPostCreated={fetchFeed} />

            <main className="py-8 px-4">
                {error && (
                    <p className="text-center text-red-400">
                        {error}
                    </p>
                )}

                {!error && posts.length === 0 && (
                    <p className="text-center text-zinc-400">
                        No posts yet. Create a post or follow someone!
                    </p>
                )}

                <div className="flex flex-col items-center gap-6">
                    {posts.map(post => {
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
                </div>
            </main>
        </div>
    );
}

export default Home;