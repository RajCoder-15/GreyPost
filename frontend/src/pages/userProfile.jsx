
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
        async function fetchProfile() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    `http://localhost:3000/profile/${username}`,
                    {
                        credentials: "include"
                    }
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
                setProfile(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [username, navigate]);

    useEffect(() => {
        if (profile?.user && profile?.currentUser) {
            const isUserFollowing = profile.currentUser.following.some(
                (id) =>
                    id.toString() === profile.user._id.toString()
            );

            setFollowing(isUserFollowing);
        }
    }, [profile]);

    async function toggleFollow() {
        if (!profile?.user || !profile?.currentUser) return;

        const user = profile.user;
        const currentUser = profile.currentUser;

        if (user._id.toString() === currentUser._id.toString()) {
            return;
        }

        const endpoint = following ? "unfollow" : "follow";

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

                const updatedFollowers = following
                    ? previous.user.followers.filter(
                        (id) =>
                            id.toString() !==
                            previous.currentUser._id.toString()
                    )
                    : [
                        ...previous.user.followers,
                        previous.currentUser._id
                    ];

                const updatedFollowing = following
                    ? previous.currentUser.following.filter(
                        (id) =>
                            id.toString() !==
                            previous.user._id.toString()
                    )
                    : [
                        ...previous.currentUser.following,
                        previous.user._id
                    ];

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
        } catch (error) {
            setError(error.message);
        } finally {
            setFollowLoading(false);
        }
    }

    if (loading) {
        return (
            <p className="p-8 text-center">
                Loading profile...
            </p>
        );
    }

    if (error && !profile) {
        return (
            <p className="p-8 text-center">
                {error}
            </p>
        );
    }

    if (!profile?.user || !profile?.currentUser) {
        return (
            <p className="p-8 text-center">
                User not found
            </p>
        );
    }

    const user = profile.user;
    const currentUser = profile.currentUser;
    const isOwnProfile =
        user._id.toString() === currentUser._id.toString();

    return (
        <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white">
            <section className="mx-auto max-w-3xl">

                <div className="mb-8 flex items-center gap-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-700 text-2xl font-semibold">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold">
                            {user.name}
                        </h1>

                        <p className="text-zinc-400">
                            @{user.username}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-5 text-sm">
                            <p>
                                <strong>
                                    {user.posts?.length || 0}
                                </strong>{" "}
                                Posts
                            </p>

                            <p>
                                <strong>
                                    {user.followers?.length || 0}
                                </strong>{" "}
                                Followers
                            </p>

                            <p>
                                <strong>
                                    {user.following?.length || 0}
                                </strong>{" "}
                                Following
                            </p>
                        </div>

                        {!isOwnProfile && (
                            <button
                                onClick={toggleFollow}
                                disabled={followLoading}
                                className={`mt-4 rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-50 ${
                                    following
                                        ? "bg-zinc-700 hover:bg-zinc-600"
                                        : "bg-blue-600 hover:bg-blue-700"
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
                </div>

                {error && (
                    <p className="mb-4 text-sm text-red-400">
                        {error}
                    </p>
                )}

                <div className="border-t border-zinc-700 pt-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Posts
                    </h2>

                    {user.posts?.length > 0 ? (
                        user.posts.map((post) => (
                            <PostCard
                                key={post._id}
                                username={user.username}
                                userId={user._id}
                                currentUserId={currentUser._id}
                                image={post.image}
                                caption={post.content}
                                isFollowing={following}
                            />
                        ))
                    ) : (
                        <p className="text-zinc-400">
                            No posts yet.
                        </p>
                    )}
                </div>

            </section>
        </main>
    );
}

export default UserProfile;
