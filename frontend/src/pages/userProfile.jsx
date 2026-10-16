import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostCard from "../Components/PostCard";

function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (loading) {
        return <p className="p-8 text-center">Loading profile...</p>;
    }

    if (error) {
        return <p className="p-8 text-center">{error}</p>;
    }

    if (!profile?.user) {
        return <p className="p-8 text-center">User not found</p>;
    }

    const user = profile.user;

    const isFollowing = profile.currentUser.following.some(
        (id) => id.toString() === user._id
    );

    return (
        <main className="min-h-screen bg-zinc-950 text-white px-4 py-8">
            <section className="max-w-3xl mx-auto">
                <div className="flex items-center gap-5 mb-8">
                    <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl">
                        {user.username?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold">
                            {user.name}
                        </h1>

                        <p className="text-zinc-400">
                            @{user.username}
                        </p>

                        <div className="flex gap-5 mt-3 text-sm">
                            <p>
                                <strong>{user.posts?.length || 0}</strong> Posts
                            </p>

                            <p>
                                <strong>{user.followers?.length || 0}</strong> Followers
                            </p>

                            <p>
                                <strong>{user.following?.length || 0}</strong> Following
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-700 pt-6">
                    <h2 className="text-lg font-semibold mb-4">
                        Posts
                    </h2>

                    {user.posts?.length > 0 ? (
                        user.posts.map((post) => (
                            <PostCard
                                key={post._id}
                                username={user.username}
                                userId={user._id}
                                currentUserId={profile.currentUser._id}
                                image={post.image}
                                caption={post.content}
                                isFollowing={isFollowing}
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