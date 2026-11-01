
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AlertCircle,
    LoaderCircle,
    Newspaper,
    BookOpen
} from "lucide-react";
import Navbar from "../Components/Navbar";
import PostCard from "../Components/PostCard";

const categories = [
    "All",
    "Technology",
    "Productivity",
    "Lifestyle",
    "Education",
    "Travel",
    "Personal",
    "Other"
];

function Home() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [currentUserId, setCurrentUserId] = useState("");
    const [followingIds, setFollowingIds] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchFeed = useCallback(async () => {
        try {
            setError("");

            const response = await fetch("http://localhost:3000/getFeed", {
                method: "GET",
                credentials: "include"
            });

            if (response.status === 401 || response.status === 403) {
                navigate("/login");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load feed");
            }

            setPosts(data.posts || []);
            setCurrentUserId(String(data.currentUserId || ""));
            setFollowingIds(
                (data.following || []).map(id => String(id?._id || id))
            );
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const filteredPosts = useMemo(() => {
        if (selectedCategory === "All") return posts;

        return posts.filter(
            post => (post.category || "Personal") === selectedCategory
        );
    }, [posts, selectedCategory]);

    const featuredPost = filteredPosts[0];
    const latestPosts = filteredPosts.slice(1);

    function getImageUrl(path) {
        if (!path || path === "default.webp") return "";
        if (path.startsWith("http")) return path;
        return `http://localhost:3000/${path.replace(/^\/+/, "")}`;
    }

    function getReadingTime(content) {
        const words = content?.trim().split(/\s+/).filter(Boolean).length || 0;
        return Math.max(1, Math.ceil(words / 200));
    }

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf7f1] text-[#49352d]">
                <LoaderCircle className="h-8 w-8 animate-spin text-[#a45b37]" />
                <p className="text-sm text-[#987b6d]">Loading GreyPost...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full overflow-x-clip bg-[#faf7f1] text-[#352b23]">
            <Navbar onPostCreated={fetchFeed} />

            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-7 lg:px-10 lg:py-12">

                {error && (
                    <div
                        role="alert"
                        className="mb-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                        <div className="min-w-0 flex-1">
                            <p className="font-semibold">Couldn't load your stories</p>
                            <p className="mt-1">{error}</p>

                            <button
                                type="button"
                                onClick={() => {
                                    setLoading(true);
                                    fetchFeed();
                                }}
                                className="mt-3 rounded-lg border border-red-300 px-3 py-1.5 font-semibold transition hover:bg-red-100"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {!error && (
                    <>
                        {featuredPost ? (
                            <section className="mb-14">
                                <div className="mb-5 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-[#a45b37]" />
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a45b37]">
                                        Editor's pick
                                    </p>
                                </div>

                                <div className={`overflow-hidden rounded-2xl border border-[#e8ded2] bg-[#f4eee5] ${
                                    featuredPost.image ? "grid md:grid-cols-2" : ""
                                }`}>
                                    <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
                                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a45b37]">
                                            {featuredPost.category || "Personal"}
                                        </span>

                                        <h1 className="mt-4 font-serif text-3xl font-semibold leading-tight text-[#352b23] sm:text-4xl lg:text-5xl">
                                            {featuredPost.title || "Untitled article"}
                                        </h1>

                                        <p className="mt-5 line-clamp-4 text-sm leading-7 text-[#796b5d] sm:text-base">
                                            {featuredPost.content}
                                        </p>

                                        <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-[#917e6d]">
                                            <span>
                                                By {featuredPost.user?.username || featuredPost.user?.name || "Unknown"}
                                            </span>
                                            <span>·</span>
                                            <span>{getReadingTime(featuredPost.content)} min read</span>
                                            <span>·</span>
                                            <span>
                                                {featuredPost.date
                                                    ? new Date(featuredPost.date).toLocaleDateString()
                                                    : "Recently published"}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                document.getElementById("latest-stories")?.scrollIntoView({
                                                    behavior: "smooth"
                                                });
                                            }}
                                            className="mt-7 flex w-fit items-center gap-2 text-sm font-semibold text-[#a45b37] transition hover:text-[#87472b]"
                                        >
                                            Explore stories
                                            <span>→</span>
                                        </button>
                                    </div>

                                    {featuredPost.image && (
                                        <div className="min-h-[260px] bg-[#e8ded2] md:min-h-[440px]">
                                            <img
                                                src={getImageUrl(featuredPost.image)}
                                                alt={featuredPost.title || "Featured article"}
                                                className="h-full min-h-[260px] w-full object-cover md:min-h-[440px]"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5">
                                    <PostCard
                                        key={featuredPost._id}
                                        postId={featuredPost._id}
                                        title={featuredPost.title || "Untitled article"}
                                        category={featuredPost.category || "Personal"}
                                        date={featuredPost.date}
                                        username={
                                            featuredPost.user?.username ||
                                            featuredPost.user?.name ||
                                            "Unknown User"
                                        }
                                        userId={String(featuredPost.user?._id || "")}
                                        profilepic={featuredPost.user?.profilepic}
                                        currentUserId={currentUserId}
                                        image={getImageUrl(featuredPost.image)}
                                        caption={featuredPost.content || ""}
                                        likes={featuredPost.likes || []}
                                        isFollowing={followingIds.includes(
                                            String(featuredPost.user?._id || "")
                                        )}
                                    />
                                </div>
                            </section>
                        ) : (
                            <section className="mb-14 rounded-2xl border border-dashed border-[#d9c6b4] bg-[#f4eee5] px-5 py-14 text-center">
                                <BookOpen size={36} className="mx-auto text-[#a45b37]" strokeWidth={1.5} />

                                <h1 className="mt-5 font-serif text-3xl text-[#352b23]">
                                    Your journal starts here.
                                </h1>

                                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#796b5d]">
                                    Discover thoughtful stories or publish your first article and share your perspective.
                                </p>
                            </section>
                        )}

                        <section className="mb-12">
                            <div className="mb-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a45b37]">
                                    Find your interest
                                </p>

                                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#352b23] sm:text-3xl">
                                    Browse topics
                                </h2>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => setSelectedCategory(category)}
                                        className={`rounded-full border px-4 py-2 text-sm transition ${
                                            selectedCategory === category
                                                ? "border-[#a45b37] bg-[#a45b37] text-white"
                                                : "border-[#ddcbbb] bg-transparent text-[#795c48] hover:border-[#a45b37] hover:text-[#a45b37]"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section id="latest-stories" className="scroll-mt-24">
                            <div className="mb-7 flex items-end justify-between border-b border-[#e8ded2] pb-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a45b37]">
                                        The journal
                                    </p>

                                    <h2 className="mt-2 font-serif text-3xl font-semibold text-[#352b23]">
                                        Latest stories
                                    </h2>
                                </div>

                                <p className="text-xs text-[#998777]">
                                    {filteredPosts.length} {filteredPosts.length === 1 ? "story" : "stories"}
                                </p>
                            </div>

                            {latestPosts.length > 0 ? (
                                <div className="space-y-9">
                                    {latestPosts.map(post => {
                                        const authorId = String(post.user?._id || "");

                                        return (
                                            <PostCard
                                                key={post._id}
                                                postId={post._id}
                                                title={post.title || "Untitled article"}
                                                category={post.category || "Personal"}
                                                date={post.date}
                                                username={
                                                    post.user?.username ||
                                                    post.user?.name ||
                                                    "Unknown User"
                                                }
                                                userId={authorId}
                                                profilepic={post.user?.profilepic}
                                                currentUserId={currentUserId}
                                                image={getImageUrl(post.image)}
                                                caption={post.content || ""}
                                                likes={post.likes || []}
                                                isFollowing={followingIds.includes(authorId)}
                                            />
                                        );
                                    })}
                                </div>
                            ) : featuredPost ? (
                                <div className="rounded-xl border border-dashed border-[#ddcbbb] px-5 py-10 text-center">
                                    <p className="font-serif text-xl text-[#514438]">
                                        You've reached the end.
                                    </p>

                                    <p className="mt-2 text-sm text-[#998777]">
                                        No more stories in this category yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-[#ddcbbb] px-5 py-10 text-center">
                                    <Newspaper size={30} className="mx-auto text-[#b49a8b]" />

                                    <p className="mt-3 font-serif text-xl text-[#514438]">
                                        No stories in this category yet.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory("All")}
                                        className="mt-3 text-sm font-semibold text-[#a45b37] hover:text-[#87472b]"
                                    >
                                        View all stories
                                    </button>
                                </div>
                            )}
                        </section>

                        <footer className="mt-16 border-t border-[#e8ded2] py-7 text-center">
                            <p className="text-xs font-semibold tracking-[0.2em] text-[#a45b37]">
                                GREYPOST
                            </p>

                            <p className="mt-2 text-xs text-[#998777]">
                                Your space, your voice.
                            </p>
                        </footer>
                    </>
                )}
            </main>
        </div>
    );
}

export default Home;
