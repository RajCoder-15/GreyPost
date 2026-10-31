
import { useEffect, useState } from "react";
import {
    Heart,
    MessageCircle,
    UserPlus,
    Send,
    Trash2,
    LoaderCircle,
    UserRound
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function PostCard({
    postId,
    username,
    userId,
    currentUserId,
    profilepic,
    image,
    caption,
    likes: initialLikes = [],
    isFollowing: initialFollowing
}) {
    const navigate = useNavigate();

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

    function getImageUrl(path) {
        if (!path || path === "default.webp") return "";

        if (path.startsWith("http")) return path;

        return `http://localhost:3000/${path.replace(/^\/+/, "")}`;
    }

    function openProfile(name) {
        if (name) {
            navigate(`/profile/${encodeURIComponent(name)}`);
        }
    }

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
                    credentials: "include"
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
            setComments((previous) => [
                data.comment,
                ...previous
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
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete comment");
            }

            setComments((previous) =>
                previous.filter((comment) => comment._id !== commentId)
            );
        } catch (error) {
            setCommentError(error.message || "Failed to delete comment");
        } finally {
            setDeletingCommentId(null);
        }
    }

    const authorImage = getImageUrl(profilepic);

    return (
        <article className="mx-auto box-border w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121218] shadow-lg shadow-black/10 transition-colors duration-200 hover:border-white/[0.12]">

            <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-5 sm:py-4">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">

                    <button
                        type="button"
                        onClick={() => openProfile(username)}
                        aria-label={`Open ${username}'s profile`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] bg-zinc-800 transition hover:border-violet-400/50 sm:h-11 sm:w-11"
                    >
                        {authorImage ? (
                            <img
                                src={authorImage}
                                alt={username}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <UserRound size={20} className="text-zinc-400" />
                        )}
                    </button>

                    <div className="min-w-0 flex-1">
                        <button
                            type="button"
                            onClick={() => openProfile(username)}
                            className="block max-w-full break-words text-left text-sm font-semibold text-zinc-100 transition hover:text-violet-300"
                        >
                            {username}
                        </button>

                        <button
                            type="button"
                            onClick={() => openProfile(username)}
                            className="block break-all text-left text-xs text-zinc-500 hover:text-violet-300"
                        >
                            @{username}
                        </button>
                    </div>
                </div>

                {String(userId) !== String(currentUserId) && (
                    <button
                        type="button"
                        onClick={toggleFollow}
                        className={`flex shrink-0 items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition sm:gap-1.5 sm:px-3 ${
                            following
                                ? "border-white/[0.08] text-zinc-400 hover:border-red-400/30 hover:text-red-300"
                                : "border-violet-400/20 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                        }`}
                    >
                        <UserPlus size={14} />
                        <span>{following ? "Following" : "Follow"}</span>
                    </button>
                )}
            </div>

            {image && (
                <div className="box-border w-full min-w-0 max-w-full overflow-hidden bg-black/20">
                    <img
                        src={image}
                        alt={`Post by ${username}`}
                        loading="lazy"
                        className="mx-auto block h-auto max-h-[650px] w-full max-w-full object-contain"
                    />
                </div>
            )}

            {caption && (
                <div className="min-w-0 px-3 pt-4 sm:px-5">
                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300 [overflow-wrap:anywhere]">
                        {caption}
                    </p>
                </div>
            )}

            <div className="flex min-w-0 flex-wrap items-center gap-1 px-2 py-3 sm:gap-2 sm:px-4">
                <button
                    type="button"
                    onClick={toggleLike}
                    disabled={likeLoading}
                    aria-label={liked ? "Unlike post" : "Like post"}
                    className={`flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition hover:bg-white/[0.04] disabled:opacity-50 sm:px-3 ${
                        liked ? "text-rose-400" : "text-zinc-400 hover:text-rose-300"
                    }`}
                >
                    {likeLoading ? (
                        <LoaderCircle size={19} className="animate-spin" />
                    ) : (
                        <Heart size={19} fill={liked ? "currentColor" : "none"} />
                    )}
                    <span>{likesCount}</span>
                </button>

                <button
                    type="button"
                    onClick={toggleComments}
                    aria-expanded={showComments}
                    className={`flex min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition hover:bg-white/[0.04] sm:px-3 ${
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
                <section className="box-border w-full min-w-0 max-w-full overflow-hidden border-t border-white/[0.07] px-3 py-4 sm:px-5">

                    <form
                        onSubmit={handleCommentSubmit}
                        className="flex min-w-0 items-center gap-2"
                    >
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            maxLength={1000}
                            className="box-border min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0b0b10] px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-400/40 sm:px-4"
                        />

                        <button
                            type="submit"
                            disabled={!commentText.trim() || commentSubmitting}
                            aria-label="Send comment"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {commentSubmitting ? (
                                <LoaderCircle size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </form>

                    {commentError && (
                        <p role="alert" className="mt-3 break-words text-sm text-red-400">
                            {commentError}
                        </p>
                    )}

                    {commentsLoading ? (
                        <div className="mt-5 flex items-center gap-2 text-sm text-zinc-400">
                            <LoaderCircle size={16} className="animate-spin" />
                            Loading comments...
                        </div>
                    ) : comments.length === 0 ? (
                        !commentError && (
                            <p className="mt-4 text-sm text-zinc-500">
                                No comments yet. Be the first!
                            </p>
                        )
                    ) : (
                        <div className="mt-5 min-w-0 space-y-4">
                            {comments.map((comment) => {
                                const commentUser = comment.user;
                                const commentUserId =
                                    commentUser?._id || commentUser;

                                const isCommentAuthor =
                                    String(commentUserId) === String(currentUserId);

                                const commentUsername =
                                    commentUser?.username ||
                                    commentUser?.name ||
                                    "User";

                                const commentImage = getImageUrl(
                                    commentUser?.profilepic
                                );

                                return (
                                    <div
                                        key={comment._id}
                                        className="flex min-w-0 items-start gap-2.5 sm:gap-3"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => openProfile(commentUser?.username)}
                                            aria-label={`Open ${commentUsername}'s profile`}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.06] bg-zinc-800"
                                        >
                                            {commentImage ? (
                                                <img
                                                    src={commentImage}
                                                    alt={commentUsername}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <UserRound size={17} className="text-zinc-400" />
                                            )}
                                        </button>

                                        <div className="box-border min-w-0 flex-1 rounded-xl bg-white/[0.025] px-3 py-3">
                                            <button
                                                type="button"
                                                onClick={() => openProfile(commentUser?.username)}
                                                className="break-words text-left text-sm font-medium text-zinc-200 hover:text-violet-300"
                                            >
                                                {commentUsername}
                                            </button>

                                            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-5 text-zinc-400 [overflow-wrap:anywhere]">
                                                {comment.content}
                                            </p>

                                            <p className="mt-2 break-words text-xs text-zinc-600">
                                                {comment.date
                                                    ? new Date(comment.date).toLocaleString()
                                                    : ""}
                                            </p>

                                            {isCommentAuthor && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    disabled={deletingCommentId === comment._id}
                                                    className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 transition hover:text-red-400 disabled:opacity-50"
                                                >
                                                    {deletingCommentId === comment._id ? (
                                                        <LoaderCircle size={13} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={13} />
                                                    )}
                                                    {deletingCommentId === comment._id
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
