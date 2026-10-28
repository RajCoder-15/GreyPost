
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserRound, Users, FileText, Image as ImageIcon } from "lucide-react";
import PostCard from "../Components/PostCard";

function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [following, setFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        let active = true;

        async function fetchProfile() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    `http://localhost:3000/profile/${username}`,
                    { credentials: "include" }
                );

                if (response.status === 401) {
                    navigate("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        response.status === 404
                            ? "User not found"
                            : "Failed to load profile"
                    );
                }

                const data = await response.json();

                if (active) {
                    setProfile(data);
                }
            } catch (err) {
                if (active) {
                    setError(err.message || "Failed to load profile");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        fetchProfile();

        return () => {
            active = false;
        };
    }, [username, navigate]);

    useEffect(() => {
        if (profile?.user && profile?.currentUser) {
            const isUserFollowing = (profile.currentUser.following || []).some(
                (id) => id.toString() === profile.user._id.toString()
            );

            setFollowing(isUserFollowing);
        }
    }, [profile]);

    function getImageUrl(image) {
        if (!image || image === "default.webp") return "";
        if (image.startsWith("http")) return image;

        return `http://localhost:3000/${image.replace(/^\/+/, "")}`;
    }

    async function toggleFollow() {
        if (!profile?.user || !profile?.currentUser) return;

        const user = profile.user;
        const currentUser = profile.currentUser;

        if (user._id.toString() === currentUser._id.toString()) return;

        const wasFollowing = following;
        const endpoint = wasFollowing ? "unfollow" : "follow";

        setFollowLoading(true);
        setError("");

        try {
            const response = await fetch(
                `http://localhost:3000/${endpoint}/${user._id}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update follow status");
            }

            setProfile((previous) => {
                if (!previous) return previous;

                const currentId = previous.currentUser._id.toString();
                const targetId = previous.user._id.toString();

                const updatedFollowers = wasFollowing
                    ? previous.user.followers.filter(
                        (item) => item.toString() !== currentId
                    )
                    : [...previous.user.followers, previous.currentUser._id];

                const updatedFollowing = wasFollowing
                    ? previous.currentUser.following.filter(
                        (item) => item.toString() !== targetId
                    )
                    : [...previous.currentUser.following, previous.user._id];

                return {
                    ...previous,
                    user: {
                        ...previous.user,
                        followers: updatedFollowers
                    },
                    currentUser: {
                        ...previous.currentUser,
                        following: updatedFollowing
                    }
                };
            });
        } catch (err) {
            setError(err.message || "Failed to update follow status");
        } finally {
            setFollowLoading(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0b0b10] text-zinc-300">
                Loading profile...
            </main>
        );
    }

    if (error && !profile) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0b0b10] px-4 text-center text-red-400">
                {error}
            </main>
        );
    }

    if (!profile?.user || !profile?.currentUser) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0b0b10] text-zinc-300">
                User not found
            </main>
        );
    }

    const user = profile.user;
    const currentUser = profile.currentUser;
    const isOwnProfile = user._id.toString() === currentUser._id.toString();
    const profileImage = getImageUrl(user.profilepic);
    const coverImage = getImageUrl(user.coverpic);
    const posts = user.posts || [];

    return (
        <main className="min-h-screen overflow-x-hidden bg-[#0b0b10] px-3 py-6 text-white sm:px-6 sm:py-10">
            <section className="mx-auto w-full max-w-3xl">
                <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#121218] sm:rounded-3xl">
                    <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-violet-950 via-[#282044] to-[#15131f] sm:h-56">
                        {coverImage && (
                            <img
                                src={coverImage}
                                alt={`${user.username}'s cover`}
                                className="absolute inset-0 h-full w-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121218]/50 via-transparent to-black/10" />

                        {!coverImage && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon size={36} className="text-white/25" />
                            </div>
                        )}
                    </div>

                    <div className="px-4 pb-6 sm:px-7 sm:pb-8">
                        <div className="-mt-12 flex min-w-0 flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
                            <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#121218] bg-gradient-to-br from-violet-500 to-fuchsia-600 sm:h-32 sm:w-32">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt={user.username || "Profile picture"}
                                        className="h-full w-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <UserRound size={42} className="text-white" />
                                )}
                            </div>

                            {!isOwnProfile && (
                                <button
                                    type="button"
                                    onClick={toggleFollow}
                                    disabled={followLoading}
                                    className={`w-full rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 sm:w-auto ${
                                        following
                                            ? "border border-white/10 bg-white/[0.06] text-zinc-200 hover:bg-white/10"
                                            : "bg-violet-500 text-white hover:bg-violet-400"
                                    }`}
                                >
                                    {followLoading
                                        ? "Please wait..."
                                        : following
                                            ? "Following"
                                            : "Follow"}
                                </button>
                            )}
                        </div>

                        <div className="mt-5 min-w-0">
                            <h1 className="break-words text-2xl font-bold sm:text-3xl">
                                {user.name || user.username}
                            </h1>

                            <p className="mt-1 break-all text-sm text-zinc-400">
                                @{user.username}
                            </p>

                            <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                                {user.bio || "No bio added yet."}
                            </p>
                        </div>

                        {error && (
                            <p className="mt-4 text-sm text-red-400">{error}</p>
                        )}

                        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-4">
                                <FileText size={18} className="mb-2 text-violet-300" />
                                <p className="text-xl font-bold">{posts.length}</p>
                                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Posts</p>
                            </div>

                            <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-4">
                                <Users size={18} className="mb-2 text-fuchsia-300" />
                                <p className="text-xl font-bold">{user.followers?.length || 0}</p>
                                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Followers</p>
                            </div>

                            <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-4">
                                <Users size={18} className="mb-2 text-indigo-300" />
                                <p className="text-xl font-bold">{user.following?.length || 0}</p>
                                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">Following</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-5 mt-8">
                    <h2 className="text-xl font-bold">Posts</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        Posts shared by @{user.username}
                    </p>
                </div>

                {posts.length > 0 ? (
                    <div className="space-y-5">
                        {posts.map((post) => (
                            <PostCard
                                key={post._id}
                                postId={post._id}
                                username={post.user?.username || user.username}
                                userId={post.user?._id || user._id}
                                currentUserId={currentUser._id}
                                image={post.image
                                    ? getImageUrl(post.image)
                                    : ""}
                                caption={post.content || ""}
                                likes={post.likes || []}
                                isFollowing={following}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-[#121218] px-4 py-12 text-center">
                        <FileText size={30} className="mx-auto text-zinc-500" />
                        <p className="mt-4 font-medium">No posts yet</p>
                        <p className="mt-1 text-sm text-zinc-500">
                            When @{user.username} shares a post, it will appear here.
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

export default UserProfile;
