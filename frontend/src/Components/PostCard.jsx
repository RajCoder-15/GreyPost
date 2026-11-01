
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
    title,
    category,
    date,
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
                id => String(id?._id || id) === String(currentUserId)
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
        if (name) navigate(`/profile/${encodeURIComponent(name)}`);
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

        if (shouldOpen) await fetchComments();
    }

    async function handleCommentSubmit(event) {
        event.preventDefault();

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
            setComments(previous => [data.comment, ...previous]);
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

            setComments(previous =>
                previous.filter(comment => comment._id !== commentId)
            );
        } catch (error) {
            setCommentError(error.message || "Failed to delete comment");
        } finally {
            setDeletingCommentId(null);
        }
    }

    function getReadingTime(text) {
        const words = text?.trim().split(/\s+/).filter(Boolean).length || 0;
        return Math.max(1, Math.ceil(words / 200));
    }

    const authorImage = getImageUrl(profilepic);

    return (
        <article className="overflow-hidden border-b border-[#e8ded2] pb-8">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={() => openProfile(username)}
                        aria-label={`Open ${username}'s profile`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e9ded1]"
                    >
                        {authorImage ? (
                            <img
                                src={authorImage}
                                alt={username}
                                className="h-full w-full object-cover"
                                onError={event => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <UserRound size={19} className="text-[#927762]" />
                        )}
                    </button>

                    <div className="min-w-0">
                        <button
                            type="button"
                            onClick={() => openProfile(username)}
                            className="block truncate text-sm font-semibold text-[#40352b] hover:text-[#a45b37]"
                        >
                            {username}
                        </button>

                        <p className="text-xs text-[#998777]">
                            {date ? new Date(date).toLocaleDateString() : "Recently published"}
                            {" · "}
                            {getReadingTime(caption)} min read
                        </p>
                    </div>
                </div>

                {String(userId) !== String(currentUserId) && (
                    <button
                        type="button"
                        onClick={toggleFollow}
                        className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#ddcbbb] px-3 py-1.5 text-xs font-medium text-[#795c48] transition hover:border-[#a45b37] hover:text-[#a45b37]"
                    >
                        <UserPlus size={13} />
                        {following ? "Following" : "Follow"}
                    </button>
                )}
            </div>

            <div className="mt-5">
                {category && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a45b37]">
                        {category}
                    </span>
                )}

                <h2 className="mt-2 font-serif text-2xl font-semibold leading-tight text-[#352b23] sm:text-3xl">
                    {title || "Untitled article"}
                </h2>
            </div>

            {image && (
                <div className="mt-5 overflow-hidden rounded-xl bg-[#eee5da]">
                    <img
                        src={image}
                        alt={title || `Article by ${username}`}
                        loading="lazy"
                        className="max-h-[420px] w-full object-cover"
                    />
                </div>
            )}

            {caption && (
                <p className="mt-5 whitespace-pre-wrap break-words text-[15px] leading-7 text-[#716356] [overflow-wrap:anywhere]">
                    {caption}
                </p>
            )}

            <div className="mt-5 flex items-center gap-5">
                <button
                    type="button"
                    onClick={toggleLike}
                    disabled={likeLoading}
                    aria-label={liked ? "Unlike article" : "Like article"}
                    className={`flex items-center gap-2 text-sm transition disabled:opacity-50 ${
                        liked ? "text-[#b34e43]" : "text-[#917e6d] hover:text-[#b34e43]"
                    }`}
                >
                    {likeLoading ? (
                        <LoaderCircle size={18} className="animate-spin" />
                    ) : (
                        <Heart size={18} fill={liked ? "currentColor" : "none"} />
                    )}
                    {likesCount}
                </button>

                <button
                    type="button"
                    onClick={toggleComments}
                    aria-expanded={showComments}
                    className="flex items-center gap-2 text-sm text-[#917e6d] transition hover:text-[#a45b37]"
                >
                    <MessageCircle size={18} />
                    Comments
                </button>
            </div>

            {showComments && (
                <section className="mt-5 border-t border-[#e8ded2] pt-5">
                    <form
                        onSubmit={handleCommentSubmit}
                        className="flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={commentText}
                            onChange={event => setCommentText(event.target.value)}
                            placeholder="Write a thoughtful comment..."
                            maxLength={1000}
                            className="min-w-0 flex-1 rounded-lg border border-[#e4d9cb] bg-white px-4 py-3 text-sm text-[#40372e] outline-none placeholder:text-[#ad9d8d] focus:border-[#a45b37]"
                        />

                        <button
                            type="submit"
                            disabled={!commentText.trim() || commentSubmitting}
                            aria-label="Send comment"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#a45b37] text-white transition hover:bg-[#87472b] disabled:opacity-40"
                        >
                            {commentSubmitting ? (
                                <LoaderCircle size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </form>

                    {commentError && (
                        <p role="alert" className="mt-3 text-sm text-red-600">
                            {commentError}
                        </p>
                    )}

                    {commentsLoading ? (
                        <div className="mt-5 flex items-center gap-2 text-sm text-[#917e6d]">
                            <LoaderCircle size={16} className="animate-spin" />
                            Loading comments...
                        </div>
                    ) : comments.length === 0 ? (
                        !commentError && (
                            <p className="mt-4 text-sm text-[#998777]">
                                No comments yet. Be the first!
                            </p>
                        )
                    ) : (
                        <div className="mt-5 space-y-4">
                            {comments.map(comment => {
                                const commentUser = comment.user;
                                const commentUserId = commentUser?._id || commentUser;
                                const isCommentAuthor =
                                    String(commentUserId) === String(currentUserId);
                                const commentUsername =
                                    commentUser?.username || commentUser?.name || "User";
                                const commentImage = getImageUrl(commentUser?.profilepic);

                                return (
                                    <div
                                        key={comment._id}
                                        className="flex items-start gap-3"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => openProfile(commentUser?.username)}
                                            aria-label={`Open ${commentUsername}'s profile`}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e9ded1]"
                                        >
                                            {commentImage ? (
                                                <img
                                                    src={commentImage}
                                                    alt={commentUsername}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserRound size={17} className="text-[#927762]" />
                                            )}
                                        </button>

                                        <div className="min-w-0 flex-1 rounded-lg bg-[#f3ede4] px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => openProfile(commentUser?.username)}
                                                className="text-sm font-semibold text-[#514438] hover:text-[#a45b37]"
                                            >
                                                {commentUsername}
                                            </button>

                                            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#716356]">
                                                {comment.content}
                                            </p>

                                            <p className="mt-2 text-xs text-[#a49484]">
                                                {comment.date
                                                    ? new Date(comment.date).toLocaleString()
                                                    : ""}
                                            </p>

                                            {isCommentAuthor && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    disabled={deletingCommentId === comment._id}
                                                    className="mt-2 flex items-center gap-1.5 text-xs text-[#998777] transition hover:text-red-600 disabled:opacity-50"
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
