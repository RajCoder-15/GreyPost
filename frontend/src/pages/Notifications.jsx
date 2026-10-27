
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, UserPlus, CheckCheck, ArrowLeft, LoaderCircle } from "lucide-react";
import Navbar from "../Components/Navbar";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [markingAll, setMarkingAll] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        try {
            setError("");

            const response = await fetch("http://localhost:3000/notifications", {
                credentials: "include"
            });

            if (response.status === 401) {
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to load notifications");
            }

            const data = await response.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            setError("Couldn't load notifications. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    async function markAllAsRead() {
        if (markingAll) return;

        setMarkingAll(true);

        try {
            const response = await fetch("http://localhost:3000/notifications/read-all", {
                method: "PATCH",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to mark notifications as read");
            }

            setNotifications(current =>
                current.map(notification => ({ ...notification, isRead: true }))
            );
        } catch (error) {
            setError("Couldn't mark notifications as read. Please try again.");
        } finally {
            setMarkingAll(false);
        }
    }

    async function markAsRead(notificationId) {
        const notification = notifications.find(item => item._id === notificationId);

        if (!notification || notification.isRead) return;

        try {
            const response = await fetch(
                `http://localhost:3000/notifications/${notificationId}/read`,
                {
                    method: "PATCH",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to mark notification as read");
            }

            setNotifications(current =>
                current.map(item =>
                    item._id === notificationId ? { ...item, isRead: true } : item
                )
            );
        } catch (error) {
            setError("Couldn't update this notification.");
        }
    }

    function getNotificationDetails(notification) {
        const sender = notification.sender?.username || notification.sender?.name || "Someone";

        if (notification.type === "like") {
            return {
                icon: Heart,
                color: "text-pink-400",
                background: "bg-pink-500/10",
                message: "liked your post"
            };
        }

        if (notification.type === "comment") {
            return {
                icon: MessageCircle,
                color: "text-violet-400",
                background: "bg-violet-500/10",
                message: "commented on your post"
            };
        }

        return {
            icon: UserPlus,
            color: "text-sky-400",
            background: "bg-sky-500/10",
            message: "started following you"
        };
    }

    function formatDate(date) {
        const value = new Date(date);
        const now = new Date();
        const seconds = Math.floor((now - value) / 1000);

        if (seconds < 60) return "Just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

        return value.toLocaleDateString(undefined, {
            day: "numeric",
            month: "short"
        });
    }

    const unreadCount = notifications.filter(item => !item.isRead).length;

    return (
        <div className="min-h-screen bg-[#09090d] text-white">
            <Navbar />

            <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
                >
                    <ArrowLeft size={17} />
                    Back
                </button>

                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Notifications
                        </h1>
                        <p className="mt-2 text-sm text-zinc-400">
                            Stay up to date with your activity.
                        </p>
                    </div>

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                        <Bell size={22} />
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                    <p className="text-sm text-zinc-400">
                        {unreadCount} unread
                    </p>

                    <button
                        type="button"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0 || markingAll}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                    >
                        <CheckCheck size={16} />
                        {markingAll ? "Updating..." : "Mark all as read"}
                    </button>
                </div>

                {error && (
                    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
                        <p>{error}</p>
                        <button
                            type="button"
                            onClick={fetchNotifications}
                            className="shrink-0 font-medium underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                        <LoaderCircle size={28} className="animate-spin text-violet-400" />
                        <p className="mt-4 text-sm">Loading notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                            <Bell size={25} />
                        </div>
                        <h2 className="mt-5 text-lg font-semibold">You're all caught up</h2>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                            When someone likes or comments on your posts, or follows you, you'll see it here.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="mt-6 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-violet-400"
                        >
                            Explore GreyPost
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                        {notifications.map(notification => {
                            const details = getNotificationDetails(notification);
                            const Icon = details.icon;
                            const sender = notification.sender?.username || notification.sender?.name || "Someone";

                            return (
                                <button
                                    type="button"
                                    key={notification._id}
                                    onClick={() => markAsRead(notification._id)}
                                    className={`flex w-full items-start gap-3 border-b border-white/[0.06] p-4 text-left transition last:border-b-0 hover:bg-white/[0.035] sm:gap-4 sm:p-5 ${
                                        notification.isRead ? "" : "bg-violet-500/[0.045]"
                                    }`}
                                >
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${details.background} ${details.color}`}>
                                        <Icon size={19} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm leading-6 text-zinc-200">
                                            <span className="font-semibold text-white">{sender}</span>{" "}
                                            {details.message}
                                        </p>

                                        {notification.post?.content && (
                                            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                                                {notification.post.content}
                                            </p>
                                        )}

                                        {notification.comment?.content && (
                                            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                                                {notification.comment.content}
                                            </p>
                                        )}

                                        <p className="mt-2 text-xs text-zinc-500">
                                            {formatDate(notification.createdAt)}
                                        </p>
                                    </div>

                                    {!notification.isRead && (
                                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Notifications;
