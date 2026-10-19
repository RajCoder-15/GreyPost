
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import PostCard from "../Components/PostCard";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingPost, setEditingPost] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        const authResponse = await fetch(
          "http://localhost:3000/me",
          { credentials: "include" }
        );

        if (!authResponse.ok) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:3000/profile",
          { credentials: "include" }
        );

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

  async function deletePost(postId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      setDeletingPostId(postId);

      const response = await fetch(
        `http://localhost:3000/delete/${postId}`,
        {
          method: "DELETE",
          credentials: "include",
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
          ),
        },
      }));
    } catch (err) {
      alert(err.message || "Could not delete the post.");
    } finally {
      setDeletingPostId(null);
    }
  }

  function startEdit(post) {
    setEditingPost(post);
    setEditCaption(post.content || "");
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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: editCaption,
          }),
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
          ),
        },
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
      <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-300">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-48 rounded-2xl bg-zinc-800" />
          <div className="h-40 rounded-2xl bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (error || !profile?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-10 text-center text-white">
        <p className="text-red-400">
          {error || "Profile data not found."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 rounded-lg bg-white px-4 py-2 font-medium text-black"
        >
          Go Home
        </button>
      </div>
    );
  }

  const user = profile.user;
  const posts = user.posts || [];

  const currentUserId =
    profile.currentUser?._id ||
    profile.currentUser?.userid ||
    "";

  const followersCount = user.followers?.length || 0;
  const followingCount = user.following?.length || 0;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">

     
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

         
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
              {user.profilepic &&
              user.profilepic !== "default.webp" ? (
                <img
                  src={
                    user.profilepic.startsWith("http")
                      ? user.profilepic
                      : `http://localhost:3000/${user.profilepic.replace(/^\/+/, "")}`
                  }
                  alt={user.username || "Profile"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound
                  size={42}
                  className="text-zinc-400"
                />
              )}
            </div>

        
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-bold">
                {user.name || user.username || "User"}
              </h1>

              <p className="mt-1 text-zinc-400">
                @{user.username || "username"}
              </p>

          
              <div className="mt-5 flex flex-wrap gap-6">

                <div>
                  <p className="text-xl font-bold">
                    {posts.length}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Posts
                  </p>
                </div>

             
                <button
                  type="button"
                  onClick={() => navigate("/profile/followers")}
                  className="text-left transition hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-zinc-500 rounded"
                >
                  <p className="text-xl font-bold">
                    {followersCount}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Followers
                  </p>
                </button>

              
                <button
                  type="button"
                  onClick={() => navigate("/profile/following")}
                  className="text-left transition hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-zinc-500 rounded"
                >
                  <p className="text-xl font-bold">
                    {followingCount}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Following
                  </p>
                </button>

              </div>
            </div>

          
            <button
              type="button"
              onClick={() => navigate("/edit-profile")}
              className="flex items-center justify-center gap-2 self-start rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium transition hover:bg-zinc-800"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          </div>

      
          <div className="mt-6 border-t border-zinc-800 pt-5">
            <h2 className="mb-2 text-sm font-semibold text-zinc-300">
              About
            </h2>

            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400">
              {user.bio || "No bio added yet."}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
            <Users size={16} />
            <span>Welcome to your GreyPost profile.</span>
          </div>
        </section>

      
        <div className="mb-5 mt-10 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Your Posts
          </h2>

          <span className="text-sm text-zinc-500">
            {posts.length}{" "}
            {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

      
        {editingPost && (
          <form
            onSubmit={updatePost}
            className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <h3 className="mb-3 font-semibold">
              Edit your post
            </h3>

            <textarea
              value={editCaption}
              onChange={(event) =>
                setEditCaption(event.target.value)
              }
              maxLength={2000}
              rows={4}
              placeholder="What's on your mind?"
              className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-white outline-none focus:border-zinc-500"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
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
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

     
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 px-5 py-12 text-center">
            <p className="text-lg font-medium">
              No posts yet
            </p>

            <p className="mt-2 text-sm text-zinc-400">
              Your posts will appear here when you share something.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Go to Home
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post._id}
                className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50"
              >
                <PostCard
                  postId={post._id}
                  username={
                    post.user?.username ||
                    user.username ||
                    user.name ||
                    "Unknown User"
                  }
                  userId={post.user?._id || user._id}
                  currentUserId={currentUserId}
                  image={
                    post.image
                      ? `http://localhost:3000${post.image}`
                      : ""
                  }
                  caption={post.content || ""}
                  likes={post.likes || []}
                  isFollowing={false}
                />

             
                <div className="flex flex-wrap gap-3 border-t border-zinc-800 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => startEdit(post)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm transition hover:bg-zinc-800"
                  >
                    <Pencil size={15} />
                    Edit Post
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePost(post._id)}
                    disabled={deletingPostId === post._id}
                    className="flex items-center gap-2 rounded-lg border border-red-900/70 px-3 py-2 text-sm text-red-400 transition hover:bg-red-950/40 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    {deletingPostId === post._id
                      ? "Deleting..."
                      : "Delete Post"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}

export default Profile;
