
import { useEffect, useState } from "react";
import {
    Heart,
    MessageCircle,
    UserPlus,
    Send
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

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentError, setCommentError] = useState("");

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

    async function fetchComments() {
        setCommentsLoading(true);
        setCommentError("");

        try {
            const response = await fetch(
                `http://localhost:3000/comments/${postId}`,
                { credentials: "include" }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load comments");
            }

            setComments(data.comments || []);
        } catch (error) {
            setCommentError(error.message || "Failed to load comments");
        } finally {
            setCommentsLoading(false);
        }
    }

    async function toggleComments() {
        const shouldOpen = !showComments;
        setShowComments(shouldOpen);

        if (shouldOpen) {
            await fetchComments();
        }
    }

    async function handleCommentSubmit(e) {
        e.preventDefault();

        const content = commentText.trim();

        if (!content || commentSubmitting) return;

        setCommentSubmitting(true);
        setCommentError("");

        try {
            const response = await fetch(
                `http://localhost:3000/comments/${postId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ content })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to add comment");
            }

            setCommentText("");
            setComments((previousComments) => [
                data.comment,
                ...previousComments
            ]);
        } catch (error) {
            setCommentError(error.message || "Failed to add comment");
        } finally {
            setCommentSubmitting(false);
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
                        <p className="text-sm text-zinc-500">@{username}</p>
                    </div>
                </div>

                {userId?.toString() !== currentUserId?.toString() && (
                    <button
                        onClick={toggleFollow}
                        className={`flex items-center gap-1 text-sm ${
                            following ? "text-zinc-400" : "text-blue-400"
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

                <button
                    onClick={toggleComments}
                    className={`flex items-center gap-2 ${
                        showComments ? "text-blue-400" : "text-zinc-400"
                    }`}
                >
                    <MessageCircle size={20} />
                    Comments
                </button>
            </div>

            {showComments && (
                <section className="mt-5 border-t border-zinc-700 pt-4">
                    <form
                        onSubmit={handleCommentSubmit}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            maxLength={1000}
                            className="min-w-0 flex-1 rounded-full bg-zinc-800 px-4 py-2 text-white outline-none"
                        />

                        <button
                            type="submit"
                            disabled={!commentText.trim() || commentSubmitting}
                            aria-label="Send comment"
                            className="rounded-full p-2 text-blue-400 disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </form>

                    {commentError && (
                        <p className="mt-3 text-sm text-red-400">
                            {commentError}
                        </p>
                    )}

                    {commentsLoading ? (
                        <p className="mt-4 text-sm text-zinc-400">
                            Loading comments...
                        </p>
                    ) : comments.length === 0 ? (
                        <p className="mt-4 text-sm text-zinc-500">
                            No comments yet. Be the first!
                        </p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {comments.map((comment) => (
                                <div
                                    key={comment._id}
                                    className="flex items-start gap-3"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm">
                                        {(comment.user?.username || "U")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold">
                                            {comment.user?.username ||
                                                comment.user?.name ||
                                                "User"}
                                        </p>

                                        <p className="break-words text-sm text-zinc-300">
                                            {comment.content}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-500">
                                            {comment.date
                                                ? new Date(comment.date).toLocaleString()
                                                : ""}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </article>
    );
}

export default PostCard;
