
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Pencil,
    Trash2,
    UserRound,
    Users,
    FileText,
    LoaderCircle,
    ArrowUpRight,
    AtSign,
    Camera,
    ImagePlus,
    X,
    Check
} from "lucide-react";
import PostCard from "../Components/PostCard";

function Profile() {
    const navigate = useNavigate();
    const profileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingPost, setEditingPost] = useState(null);
    const [editCaption, setEditCaption] = useState("");
    const [saving, setSaving] = useState(false);
    const [deletingPostId, setDeletingPostId] = useState(null);
    const [uploadingType, setUploadingType] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [previewProfile, setPreviewProfile] = useState("");
    const [previewCover, setPreviewCover] = useState("");
    const [selectedProfileFile, setSelectedProfileFile] = useState(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchProfile() {
            try {
                const authResponse = await fetch("http://localhost:3000/me", {
                    credentials: "include"
                });

                if (!authResponse.ok) {
                    navigate("/login");
                    return;
                }

                const response = await fetch("http://localhost:3000/profile", {
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("Failed to load your profile.");
                }

                const data = await response.json();

                if (isMounted) {
                    setProfile(data);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "Something went wrong.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    useEffect(() => {
        return () => {
            if (previewProfile) URL.revokeObjectURL(previewProfile);
            if (previewCover) URL.revokeObjectURL(previewCover);
        };
    }, [previewProfile, previewCover]);

    function getImageUrl(image) {
        if (!image || image === "default.webp") return "";
        if (image.startsWith("http")) return image;
        return `http://localhost:3000/${image.replace(/^\/+/, "")}`;
    }

    function handleImageSelection(event, type) {
        const file = event.target.files?.[0];

        if (!file) return;

        setUploadError("");

        if (!file.type.startsWith("image/")) {
            setUploadError("Please select a valid image file.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError("Image size must be 5 MB or less.");
            event.target.value = "";
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        if (type === "profile") {
            setPreviewProfile((previous) => {
                if (previous) URL.revokeObjectURL(previous);
                return previewUrl;
            });
            setSelectedProfileFile(file);
        } else {
            setPreviewCover((previous) => {
                if (previous) URL.revokeObjectURL(previous);
                return previewUrl;
            });
            setSelectedCoverFile(file);
        }

        event.target.value = "";
    }

    async function uploadImage(type) {
        const file = type === "profile" ? selectedProfileFile : selectedCoverFile;

        if (!file) return;

        const endpoint = type === "profile"
            ? "/profile/upload-picture"
            : "/profile/upload-cover";

        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploadingType(type);
            setUploadError("");

            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Image upload failed.");
            }

            setProfile((previous) => ({
                ...previous,
                user: {
                    ...previous.user,
                    ...data.user
                }
            }));

            if (type === "profile") {
                setSelectedProfileFile(null);
                setPreviewProfile((previous) => {
                    if (previous) URL.revokeObjectURL(previous);
                    return "";
                });
            } else {
                setSelectedCoverFile(null);
                setPreviewCover((previous) => {
                    if (previous) URL.revokeObjectURL(previous);
                    return "";
                });
            }
        } catch (err) {
            setUploadError(err.message || "Could not upload image.");
        } finally {
            setUploadingType("");
        }
    }

    function cancelImageSelection(type) {
        if (type === "profile") {
            setSelectedProfileFile(null);
            setPreviewProfile((previous) => {
                if (previous) URL.revokeObjectURL(previous);
                return "";
            });
        } else {
            setSelectedCoverFile(null);
            setPreviewCover((previous) => {
                if (previous) URL.revokeObjectURL(previous);
                return "";
            });
        }

        setUploadError("");
    }

    async function deletePost(postId) {
        if (!window.confirm("Are you sure you want to delete this post?")) {
            return;
        }

        try {
            setDeletingPostId(postId);

            const response = await fetch(
                `http://localhost:3000/delete/${postId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete post.");
            }

            setProfile((previous) => ({
                ...previous,
                user: {
                    ...previous.user,
                    posts: previous.user.posts.filter(
                        (post) => post._id !== postId
                    )
                }
            }));

            if (editingPost?._id === postId) {
                setEditingPost(null);
                setEditCaption("");
            }
        } catch (err) {
            alert(err.message || "Could not delete the post.");
        } finally {
            setDeletingPostId(null);
        }
    }

    function startEdit(post) {
        setEditingPost(post);
        setEditCaption(post.content || "");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    async function updatePost(event) {
        event.preventDefault();

        if (!editingPost) return;

        try {
            setSaving(true);

            const response = await fetch(
                `http://localhost:3000/update/${editingPost._id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        content: editCaption
                    })
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Failed to update post.");
            }

            setProfile((previous) => ({
                ...previous,
                user: {
                    ...previous.user,
                    posts: previous.user.posts.map((post) =>
                        post._id === editingPost._id
                            ? { ...post, content: editCaption }
                            : post
                    )
                }
            }));

            setEditingPost(null);
            setEditCaption("");
        } catch (err) {
            alert(err.message || "Could not update the post.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0b0b10] px-4 text-white">
                <div className="flex flex-col items-center gap-4">
                    <LoaderCircle size={36} className="animate-spin text-violet-400" />
                    <p className="text-sm text-zinc-400">Loading your profile...</p>
                </div>
            </main>
        );
    }

    if (error || !profile?.user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0b0b10] px-4 text-white">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-6 text-center sm:p-8">
                    <UserRound size={30} className="mx-auto mb-4 text-red-400" />
                    <h2 className="text-xl font-semibold">Profile unavailable</h2>
                    <p className="mt-2 break-words text-sm text-zinc-400">
                        {error || "We couldn't find your profile."}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="mt-6 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-400"
                    >
                        Go to Home
                    </button>
                </div>
            </main>
        );
    }

    const user = profile.user;
    const posts = user.posts || [];
    const currentUserId = profile.currentUser?._id || profile.currentUser?.userid || "";
    const followersCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;
    const profileImage = getImageUrl(user.profilepic);
    const coverImage = getImageUrl(user.coverpic);

    return (
        <main className="relative min-h-screen overflow-x-clip bg-[#0b0b10] px-3 py-6 text-white sm:px-6 sm:py-10">
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-full -translate-x-1/2 rounded-full bg-violet-600/[0.08] blur-[100px]" />

            <div className="relative mx-auto w-full min-w-0 max-w-4xl">
                <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#121218] shadow-2xl shadow-black/20 sm:rounded-3xl">
                    <div className="relative h-36 overflow-hidden bg-gradient-to-br from-violet-950 via-[#282044] to-[#15131f] sm:h-52">
                        {coverImage && (
                            <img
                                src={coverImage}
                                alt="Profile cover"
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        )}

                        <div className="absolute inset-0 bg-black/10" />

                        <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:left-7 sm:top-6">
                            Your space on GreyPost
                        </div>

                        <button
                            type="button"
                            onClick={() => coverInputRef.current?.click()}
                            className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-black/75 sm:bottom-5 sm:right-5 sm:px-4 sm:text-sm"
                        >
                            <ImagePlus size={16} />
                            Change cover
                        </button>

                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => handleImageSelection(event, "cover")}
                        />
                    </div>

                    <div className="w-full min-w-0 px-3 pb-5 sm:px-8 sm:pb-8">
                        <div className="-mt-12 flex min-w-0 flex-col items-start gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
                            <div className="relative h-24 w-24 shrink-0 rounded-full border-4 border-[#121218] bg-gradient-to-br from-violet-500 to-fuchsia-600 p-[3px] shadow-xl shadow-violet-950/30 sm:h-32 sm:w-32">
                                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#1b1b25]">
                                    {previewProfile || profileImage ? (
                                        <img
                                            src={previewProfile || profileImage}
                                            alt={user.username || "Profile"}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <UserRound size={42} className="text-violet-200 sm:h-12 sm:w-12" />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => profileInputRef.current?.click()}
                                    aria-label="Change profile picture"
                                    title="Change profile picture"
                                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#121218] bg-violet-500 text-white transition hover:bg-violet-400"
                                >
                                    <Camera size={16} />
                                </button>

                                <input
                                    ref={profileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) => handleImageSelection(event, "profile")}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/edit-profile")}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-300/50 hover:bg-violet-500/20 sm:w-auto"
                            >
                                <Pencil size={15} />
                                Edit Profile
                            </button>
                        </div>

                        {uploadError && (
                            <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-300">
                                <p>{uploadError}</p>
                                <button type="button" onClick={() => setUploadError("")} aria-label="Dismiss error">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {(selectedProfileFile || selectedCoverFile) && (
                            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] p-3">
                                <p className="min-w-0 flex-1 text-sm text-zinc-300">
                                    {selectedProfileFile && selectedCoverFile
                                        ? "Profile picture and cover selected"
                                        : selectedProfileFile
                                            ? "New profile picture selected"
                                            : "New cover image selected"}
                                </p>

                                {selectedProfileFile && (
                                    <button
                                        type="button"
                                        onClick={() => uploadImage("profile")}
                                        disabled={!!uploadingType}
                                        className="rounded-lg bg-violet-500 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-400 disabled:opacity-50"
                                    >
                                        {uploadingType === "profile" ? "Uploading..." : "Save picture"}
                                    </button>
                                )}

                                {selectedCoverFile && (
                                    <button
                                        type="button"
                                        onClick={() => uploadImage("cover")}
                                        disabled={!!uploadingType}
                                        className="rounded-lg bg-violet-500 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-400 disabled:opacity-50"
                                    >
                                        {uploadingType === "cover" ? "Uploading..." : "Save cover"}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        cancelImageSelection("profile");
                                        cancelImageSelection("cover");
                                    }}
                                    disabled={!!uploadingType}
                                    className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] disabled:opacity-50"
                                    aria-label="Cancel selected images"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div className="mt-5 min-w-0">
                            <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                                {user.name || user.username || "User"}
                            </h1>
                            <p className="mt-1 flex min-w-0 items-start gap-1.5 text-sm text-zinc-400">
                                <AtSign size={14} className="mt-0.5 shrink-0" />
                                <span className="break-all">{user.username || "username"}</span>
                            </p>
                        </div>

                        <div className="mt-6 grid min-w-0 grid-cols-3 gap-2 sm:mt-7 sm:gap-3">
                            <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:rounded-2xl sm:p-4">
                                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 sm:h-8 sm:w-8">
                                    <FileText size={16} />
                                </div>
                                <p className="text-lg font-bold tabular-nums sm:text-2xl">{posts.length}</p>
                                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Posts</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/profile/followers")}
                                className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 text-left transition hover:border-violet-400/30 hover:bg-violet-500/[0.06] sm:rounded-2xl sm:p-4"
                            >
                                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-300 sm:h-8 sm:w-8">
                                    <Users size={16} />
                                </div>
                                <p className="text-lg font-bold tabular-nums sm:text-2xl">{followersCount}</p>
                                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Followers</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/profile/following")}
                                className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5 text-left transition hover:border-violet-400/30 hover:bg-violet-500/[0.06] sm:rounded-2xl sm:p-4"
                            >
                                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300 sm:h-8 sm:w-8">
                                    <Users size={16} />
                                </div>
                                <p className="text-lg font-bold tabular-nums sm:text-2xl">{followingCount}</p>
                                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Following</p>
                            </button>
                        </div>

                        <div className="mt-5 min-w-0 rounded-xl border border-white/[0.07] bg-black/10 p-3.5 sm:rounded-2xl sm:p-5">
                            <div className="mb-2 flex items-center gap-2">
                                <div className="h-5 w-1 rounded-full bg-violet-400" />
                                <h2 className="text-sm font-semibold text-zinc-200">About</h2>
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400 [overflow-wrap:anywhere]">
                                {user.bio || "No bio added yet. Tell people a little about yourself."}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="mb-5 mt-8 flex min-w-0 items-end justify-between gap-3 sm:mt-10">
                    <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-violet-400">
                            Your activity
                        </p>
                        <h2 className="text-2xl font-bold tracking-tight">Your Posts</h2>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
                        {posts.length} {posts.length === 1 ? "post" : "posts"}
                    </span>
                </div>

                {editingPost && (
                    <form
                        onSubmit={updatePost}
                        className="mb-6 w-full overflow-hidden rounded-2xl border border-violet-400/20 bg-[#121218] p-3.5 sm:p-6"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                                <Pencil size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold">Edit your post</h3>
                                <p className="mt-0.5 text-xs text-zinc-500">Update your caption below.</p>
                            </div>
                        </div>

                        <textarea
                            value={editCaption}
                            onChange={(event) => setEditCaption(event.target.value)}
                            maxLength={2000}
                            rows={4}
                            placeholder="What's on your mind?"
                            className="w-full resize-y rounded-xl border border-white/10 bg-[#0b0b10] p-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-violet-400/60 sm:p-4"
                        />

                        <div className="mt-2 text-right text-xs text-zinc-500">
                            {editCaption.length}/2000
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                    setEditingPost(null);
                                    setEditCaption("");
                                }}
                                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.05] disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {posts.length === 0 ? (
                    <div className="relative w-full overflow-hidden rounded-2xl border border-dashed border-white/10 bg-[#121218] px-4 py-12 text-center sm:rounded-3xl sm:py-16">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                            <FileText size={28} />
                        </div>
                        <h3 className="mt-5 text-lg font-semibold">No posts yet</h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
                            Your posts will appear here when you share something with the community.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-400"
                        >
                            Explore GreyPost
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="w-full space-y-5">
                        {posts.map((post) => (
                            <div key={post._id} className="relative w-full min-w-0">
                                <PostCard
                                    postId={post._id}
                                    username={post.user?.username || user.username || user.name || "Unknown User"}
                                    userId={post.user?._id || user._id}
                                    currentUserId={currentUserId}
                                    image={post.image ? `http://localhost:3000${post.image}` : ""}
                                    caption={post.content || ""}
                                    likes={post.likes || []}
                                    isFollowing={false}
                                />

                                <button
                                    type="button"
                                    onClick={() => startEdit(post)}
                                    aria-label="Edit post"
                                    title="Edit post"
                                    className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#1a1922] text-zinc-300 hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-violet-300 sm:right-4 sm:top-4"
                                >
                                    <Pencil size={16} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => deletePost(post._id)}
                                    disabled={deletingPostId === post._id}
                                    aria-label="Delete post"
                                    title="Delete post"
                                    className="absolute bottom-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-[#1a1922] text-red-400 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50 sm:bottom-4 sm:right-4"
                                >
                                    {deletingPostId === post._id ? (
                                        <LoaderCircle size={16} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <footer className="break-words py-8 pt-10 text-center text-xs text-zinc-600">
                    Made for your thoughts. Made for GreyPost.
                </footer>
            </div>
        </main>
    );
}

export default Profile;
