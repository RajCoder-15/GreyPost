
import { useEffect, useState } from "react";
import { X, ImagePlus } from "lucide-react";

function CreatePostModal({ onClose, onPostCreated }) {
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    function handleImageChange(e) {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be 5 MB or less.");
            return;
        }

        setError("");
        setImage(file);
        setPreview(URL.createObjectURL(file));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!caption.trim() && !image) {
            setError("Add a caption or choose an image.");
            return;
        }

        const formData = new FormData();
        formData.append("content", caption);

        if (image) {
            formData.append("image", image);
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:3000/post",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create post."
                );
            }

            onPostCreated?.(data.post);
            onClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-zinc-900 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                        Create Post
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="text-zinc-400 hover:text-white"
                    >
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's on your mind?"
                        className="h-32 w-full resize-none rounded-xl bg-zinc-800 p-4 text-white outline-none"
                    />

                    {preview && (
                        <img
                            src={preview}
                            alt="Selected post preview"
                            className="mt-4 max-h-72 w-full rounded-xl object-cover"
                        />
                    )}

                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-zinc-400">
                        <ImagePlus size={20} />
                        Add Image

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>

                    {error && (
                        <p className="mt-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full rounded-xl bg-white py-3 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreatePostModal;
