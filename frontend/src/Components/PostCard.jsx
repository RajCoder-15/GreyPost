
import { useEffect, useState } from "react";
import {
    Heart,
    MessageCircle,
    UserPlus
} from "lucide-react";

function PostCard({
    postId,
    username,
    userId,
    currentUserId,
    image,
    caption,
    likes: initialLikes = [],
    isFollowing: initialFollowing
}) {
    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikes.length);
    const [following, setFollowing] = useState(initialFollowing);

    useEffect(() => {
        setLiked(
            initialLikes.some(
                (id) => id.toString() === currentUserId?.toString()
            )
        );
        setLikesCount(initialLikes.length);
    }, [initialLikes, currentUserId]);

    useEffect(() => {
        setFollowing(initialFollowing);
    }, [initialFollowing]);

    async function toggleFollow() {
        const endpoint = following ? "unfollow" : "follow";

        try {
            const response = await fetch(
                `http://localhost:3000/${endpoint}/${userId}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (response.ok) {
                setFollowing(!following);
            } else {
                console.error("Failed to update follow status");
            }
        } catch (error) {
            console.error("Follow request failed:", error);
        }
    }

    async function toggleLike() {
        if (likeLoading) return;

        setLikeLoading(true);

        try {
            const response = await fetch(
                `http://localhost:3000/like/${postId}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update like");
            }

            const data = await response.json();

            setLiked(data.liked);
            setLikesCount(data.likes.length);
        } catch (error) {
            console.error("Like request failed:", error);
        } finally {
            setLikeLoading(false);
        }
    }

    return (
        <article className="mx-auto w-full max-w-xl border-b border-zinc-700 py-6">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                        {username?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h3 className="font-semibold">{username}</h3>
                        <p className="text-sm text-zinc-500">
                            @{username}
                        </p>
                    </div>
                </div>

                {userId?.toString() !== currentUserId?.toString() && (
                    <button
                        onClick={toggleFollow}
                        className={`flex items-center gap-1 text-sm ${
                            following
                                ? "text-zinc-400"
                                : "text-blue-400"
                        }`}
                    >
                        <UserPlus size={18} />
                        {following ? "Following" : "Follow"}
                    </button>
                )}
            </div>

            {image && (
                <img
                    src={image}
                    alt="Post"
                    className="mb-4 w-full rounded-xl"
                />
            )}

            <p className="mb-4 text-zinc-200">{caption}</p>

            <div className="flex gap-6">
                <button
                    onClick={toggleLike}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 ${
                        liked ? "text-red-500" : "text-zinc-400"
                    } disabled:opacity-50`}
                >
                    <Heart
                        size={20}
                        fill={liked ? "currentColor" : "none"}
                    />
                    {liked ? "Liked" : "Like"} {likesCount}
                </button>

                <button className="flex items-center gap-2 text-zinc-400">
                    <MessageCircle size={20} />
                    Comment
                </button>
            </div>
        </article>
    );
}

export default PostCard;
