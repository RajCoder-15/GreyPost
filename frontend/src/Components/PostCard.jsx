
import { useEffect, useState } from "react";
import {
    Heart,
    MessageCircle,
    UserPlus,
    Send,
    Trash2,
} from "lucide-react";

function PostCard({
    postId,
    username,
    userId,
    currentUserId,
    image,
    caption,
    likes: initialLikes = [],
    isFollowing: initialFollowing,
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
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [commentError, setCommentError] = useState("");

    useEffect(() => {
        setLiked(
            initialLikes.some(
                (id) => String(id?._id || id) === String(currentUserId)
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
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update follow status");
            }

            setFollowing(!following);
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
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update like");
            }

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
                {
                    credentials: "include",
                }
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
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to add comment");
            }

            setCommentText("");
            setComments((previousComments) => [
                data.comment,
                ...previousComments,
            ]);
        } catch (error) {
            setCommentError(error.message || "Failed to add comment");
        } finally {
            setCommentSubmitting(false);
        }
    }

    async function handleDeleteComment(commentId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmed || deletingCommentId) return;

        setDeletingCommentId(commentId);
        setCommentError("");

        try {
            const response = await fetch(
                `http://localhost:3000/comments/item/${commentId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete comment"
                );
            }

            setComments((previousComments) =>
                previousComments.filter(
                    (comment) => comment._id !== commentId
                )
            );
        } catch (error) {
            setCommentError(
                error.message || "Failed to delete comment"
            );
        } finally {
            setDeletingCommentId(null);
        }
    }

    return (
        <article className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121218] shadow-lg shadow-black/10 transition-colors duration-200 hover:border-white/[0.12]">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-base font-semibold text-violet-300">
                        {username?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-zinc-100">
                            {username}
                        </h3>
                        <p className="truncate text-xs text-zinc-500">
                            @{username}
                        </p>
                    </div>
                </div>

                {String(userId) !== String(currentUserId) && (
                    <button
                        type="button"
                        onClick={toggleFollow}
                        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                            following
                                ? "border-white/[0.08] text-zinc-400 hover:border-red-400/30 hover:text-red-300"
                                : "border-violet-400/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                        }`}
                    >
                        <UserPlus size={15} />
                        {following ? "Following" : "Follow"}
                    </button>
                )}
            </div>

            {image && (
                <div className="overflow-hidden bg-black/20">
                    <img
                        src={image}
                        alt={`Post by ${username}`}
                        loading="lazy"
                        className="block max-h-[650px] w-full object-contain"
                    />
                </div>
            )}

            {caption && (
                <div className="px-4 pt-4 sm:px-5">
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                        {caption}
                    </p>
                </div>
            )}

            <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
                <button
                    type="button"
                    onClick={toggleLike}
                    disabled={likeLoading}
                    aria-label={liked ? "Unlike post" : "Like post"}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-white/[0.04] disabled:opacity-50 ${
                        liked
                            ? "text-rose-400"
                            : "text-zinc-400 hover:text-rose-300"
                    }`}
                >
                    <Heart
                        size={19}
                        fill={liked ? "currentColor" : "none"}
                        className="transition-transform duration-200"
                    />
                    <span>{likesCount}</span>
                </button>

                <button
                    type="button"
                    onClick={toggleComments}
                    aria-expanded={showComments}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-white/[0.04] ${
                        showComments
                            ? "text-violet-300"
                            : "text-zinc-400 hover:text-violet-300"
                    }`}
                >
                    <MessageCircle size={19} />
                    <span>Comments</span>
                </button>
            </div>

            {showComments && (
                <section className="border-t border-white/[0.07] px-4 py-4 sm:px-5">
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
                            className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0b0b10] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-400/40"
                        />

                        <button
                            type="submit"
                            disabled={!commentText.trim() || commentSubmitting}
                            aria-label="Send comment"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Send size={18} />
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
                        !commentError && (
                            <p className="mt-4 text-sm text-zinc-500">
                                No comments yet. Be the first!
                            </p>
                        )
                    ) : (
                        <div className="mt-5 space-y-5">
                            {comments.map((comment) => {
                                const commentUserId =
                                    comment.user?._id || comment.user;

                                const isCommentAuthor =
                                    String(commentUserId) ===
                                    String(currentUserId);

                                return (
                                    <div
                                        key={comment._id}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-zinc-800 text-sm font-medium text-zinc-300">
                                            {(
                                                comment.user?.username ||
                                                comment.user?.name ||
                                                "U"
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1 rounded-xl bg-white/[0.025] px-3 py-3">
                                            <p className="text-sm font-medium text-zinc-200">
                                                {comment.user?.username ||
                                                    comment.user?.name ||
                                                    "User"}
                                            </p>

                                            <p className="mt-1 break-words text-sm leading-5 text-zinc-400">
                                                {comment.content}
                                            </p>

                                            <p className="mt-2 text-xs text-zinc-600">
                                                {comment.date
                                                    ? new Date(
                                                          comment.date
                                                      ).toLocaleString()
                                                    : ""}
                                            </p>

                                            {isCommentAuthor && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteComment(
                                                            comment._id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingCommentId ===
                                                        comment._id
                                                    }
                                                    className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-red-400 disabled:opacity-50"
                                                >
                                                    <Trash2 size={13} />
                                                    {deletingCommentId ===
                                                    comment._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </article>
    );
}

export default PostCard;
