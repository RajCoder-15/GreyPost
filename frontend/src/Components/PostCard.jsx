import { useState } from "react";
import {
    Heart,
    MessageCircle,
    UserPlus
} from "lucide-react";

function PostCard({ username, image, caption }) {

    const [liked, setLiked] = useState(false);
    const [following, setFollowing] = useState(false);

    return (
        <article className="w-full max-w-xl mx-auto py-6 border-b border-zinc-700">


            <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-zinc-700"></div>

                    <div>
                        <h3 className="font-semibold">
                            {username}
                        </h3>

                        <p className="text-sm text-zinc-500">
                            @{username}
                        </p>
                    </div>

                </div>

                <button
                    onClick={() => setFollowing(!following)}
                    className={`flex items-center gap-1 text-sm ${
                        following
                            ? "text-zinc-400"
                            : "text-blue-400"
                    }`}
                >
                    <UserPlus size={18} />

                    {following ? "Following" : "Follow"}
                </button>

            </div>


            {image && (
                <img
                    src={image}
                    alt="Post"
                    className="w-full rounded-xl mb-4"
                />
            )}

            <p className="text-zinc-200 mb-4">
                {caption}
            </p>

            <div className="flex gap-6">

                <button
                    onClick={() => setLiked(!liked)}
                    className={`flex items-center gap-2 ${
                        liked
                            ? "text-red-500"
                            : "text-zinc-400"
                    }`}
                >
                    <Heart
                        size={20}
                        fill={liked ? "currentColor" : "none"}
                    />

                    {liked ? "Liked" : "Like"}
                </button>

                <button className="flex items-center gap-2 text-zinc-400">
                    <MessageCircle size={20} />
                    Comment
                </button>

            </div>

        </article>
    );
}

export default PostCard;