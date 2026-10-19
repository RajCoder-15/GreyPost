
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  UserRound,
  Users,
  FileText,
  LoaderCircle,
  ArrowUpRight,
  Sparkles,
  AtSign,
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
        const authResponse = await fetch("http://localhost:3000/me", {
          credentials: "include",
        });

        if (!authResponse.ok) {
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:3000/profile", {
          credentials: "include",
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
      behavior: "smooth",
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
      <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#0b0b10] text-white">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle
            size={36}
            className="animate-spin text-violet-400"
          />
          <p className="text-sm text-zinc-400">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (error || !profile?.user) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#0b0b10] px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <UserRound size={26} />
          </div>

          <h2 className="text-xl font-semibold">
            Profile unavailable
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            {error || "We couldn't find your profile."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Go to Home
          </button>
        </div>
      </main>
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

  const profileImage = user.profilepic
    ? user.profilepic === "default.webp"
      ? ""
      : user.profilepic.startsWith("http")
        ? user.profilepic
        : `http://localhost:3000/${user.profilepic.replace(/^\/+/, "")}`
    : "";

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#0b0b10] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 left-1/2 h-80 w-[38rem] max-w-full -translate-x-1/2 rounded-full bg-violet-600/[0.12] blur-[110px]"
      />

      <div className="relative mx-auto w-full min-w-0 max-w-4xl">
        <section className="relative isolate w-full min-w-0 overflow-hidden rounded-3xl border border-white/[0.09] bg-[#121218] shadow-2xl shadow-black/20">
          <div className="relative h-36 overflow-hidden bg-gradient-to-br from-violet-950 via-[#282044] to-[#15131f] sm:h-44">
            <div
              aria-hidden="true"
              className="absolute -right-10 -top-24 h-64 w-64 rounded-full border border-violet-300/10 bg-violet-400/[0.06]"
            />
            <div
              aria-hidden="true"
              className="absolute -right-2 -top-16 h-48 w-48 rounded-full border border-violet-300/10"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl"
            />

            <div className="absolute left-4 top-5 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-violet-100 backdrop-blur-md sm:left-7 sm:top-6">
              <Sparkles size={13} />
              Your space on GreyPost
            </div>
          </div>

          <div className="px-4 pb-6 sm:px-8 sm:pb-8">
            <div className="-mt-14 flex min-w-0 flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-[#121218] bg-gradient-to-br from-violet-500 to-fuchsia-600 p-[3px] shadow-xl shadow-violet-950/30 sm:h-32 sm:w-32">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#1b1b25]">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={user.username || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound
                      size={48}
                      className="text-violet-200"
                    />
                  )}
                </div>

                <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-[3px] border-[#121218] bg-violet-400" />
              </div>

              <button
                type="button"
                onClick={() => navigate("/edit-profile")}
                className="flex w-fit items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-300/50 hover:bg-violet-500/20"
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            </div>

            <div className="mt-5 min-w-0">
              <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                {user.name || user.username || "User"}
              </h1>

              <p className="mt-1 flex min-w-0 items-center gap-1.5 break-all text-sm text-zinc-400">
                <AtSign size={14} className="shrink-0" />
                {user.username || "username"}
              </p>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 sm:p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                  <FileText size={17} />
                </div>
                <p className="text-xl font-bold tabular-nums sm:text-2xl">
                  {posts.length}
                </p>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Posts
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/profile/followers")}
                className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:border-violet-400/30 hover:bg-violet-500/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-500/50 sm:p-4"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-300">
                  <Users size={17} />
                </div>
                <p className="text-xl font-bold tabular-nums sm:text-2xl">
                  {followersCount}
                </p>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Followers
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate("/profile/following")}
                className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-left transition hover:border-violet-400/30 hover:bg-violet-500/[0.06] focus:outline-none focus:ring-2 focus:ring-violet-500/50 sm:p-4"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                  <Users size={17} />
                </div>
                <p className="text-xl font-bold tabular-nums sm:text-2xl">
                  {followingCount}
                </p>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Following
                </p>
              </button>
            </div>

            <div className="mt-5 min-w-0 rounded-2xl border border-white/[0.07] bg-black/10 p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-violet-400" />
                <h2 className="text-sm font-semibold text-zinc-200">
                  About
                </h2>
              </div>

              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400">
                {user.bio ||
                  "No bio added yet. Tell people a little about yourself."}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
              <span>A little corner of the internet, just for you.</span>
            </div>
          </div>
        </section>

        <div className="mb-5 mt-10 flex min-w-0 items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Your activity
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              Your Posts
            </h2>
          </div>

          <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {editingPost && (
          <form
            onSubmit={updatePost}
            className="mb-6 w-full min-w-0 overflow-hidden rounded-2xl border border-violet-400/20 bg-[#121218] p-4 shadow-lg shadow-violet-950/10 sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <Pencil size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold">Edit your post</h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Update your caption below.
                </p>
              </div>
            </div>

            <textarea
              value={editCaption}
              onChange={(event) => setEditCaption(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="What's on your mind?"
              className="w-full min-w-0 resize-y rounded-xl border border-white/10 bg-[#0b0b10] p-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/60"
            />

            <div className="mt-2 text-right text-xs text-zinc-500">
              {editCaption.length}/2000
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.05] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {posts.length === 0 ? (
          <div className="relative w-full min-w-0 overflow-hidden rounded-3xl border border-dashed border-white/10 bg-[#121218] px-5 py-14 text-center sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-36 w-64 max-w-full -translate-x-1/2 rounded-full bg-violet-500/[0.08] blur-3xl"
            />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
              <FileText size={28} />
            </div>

            <h3 className="relative mt-5 text-lg font-semibold">
              No posts yet
            </h3>

            <p className="relative mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
              Your posts will appear here when you share something with the community.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Explore GreyPost
              <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <div className="w-full min-w-0 space-y-5">
            {posts.map((post) => (
              <div key={post._id} className="relative w-full min-w-0">
                <div className="relative w-full min-w-0 overflow-hidden rounded-2xl">
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

                  <button
                    type="button"
                    onClick={() => startEdit(post)}
                    aria-label="Edit post"
                    title="Edit post"
                    className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#1a1922] text-zinc-300 transition hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-violet-300 sm:right-4 sm:top-4"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => deletePost(post._id)}
                    disabled={deletingPostId === post._id}
                    aria-label="Delete post"
                    title="Delete post"
                    className="absolute bottom-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-[#1a1922] text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 sm:bottom-4 sm:right-4"
                  >
                    {deletingPostId === post._id ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="pb-8 pt-10 text-center text-xs text-zinc-600">
          Made for your thoughts. Made for GreyPost.
        </footer>
      </div>
    </main>
  );
}

export default Profile;
