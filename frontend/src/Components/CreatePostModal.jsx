
import { useEffect, useState } from "react";
import {
    X,
    ImagePlus,
    Send,
    LoaderCircle,
    AlertCircle,
    Trash2,
    FileText
} from "lucide-react";

const categories = [
    "Technology",
    "Productivity",
    "Lifestyle",
    "Education",
    "Travel",
    "Personal",
    "Other"
];

function CreatePostModal({ onClose, onPostCreated }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("Personal");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!preview) return;
        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    useEffect(() => {
        function handleEscape(event) {
            if (event.key === "Escape" && !loading) onClose();
        }

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [loading, onClose]);

    function handleImageChange(event) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be 5 MB or less.");
            event.target.value = "";
            return;
        }

        setError("");
        setImage(file);
        setPreview(URL.createObjectURL(file));
    }

    function removeImage() {
        setImage(null);
        setPreview("");

        const input = document.getElementById("article-image");
        if (input) input.value = "";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!title.trim()) {
            setError("Please enter an article title.");
            return;
        }

        if (!content.trim()) {
            setError("Please write some content before publishing.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("content", content.trim());
        formData.append("category", category);

        if (image) {
            formData.append("image", image);
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:3000/post", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Failed to publish article.");
            }

            onPostCreated?.(data.post);
            onClose();
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211c18]/60 p-3 sm:p-6">
            <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#e8dfd4] bg-[#faf7f1] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#e8dfd4] px-6 py-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a45b37]">
                            GreyPost Journal
                        </p>
                        <h2 className="mt-1 font-serif text-2xl text-[#302820]">
                            Write an article
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-full p-2 text-[#75695e] transition hover:bg-[#eee7dc] hover:text-[#302820] disabled:opacity-50"
                    >
                        <X size={21} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="space-y-5 overflow-y-auto px-6 py-6">
                        <div>
                            <label
                                htmlFor="article-title"
                                className="mb-2 block text-sm font-semibold text-[#514438]"
                            >
                                Article title
                            </label>

                            <input
                                id="article-title"
                                type="text"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                maxLength={150}
                                placeholder="Give your story a meaningful title..."
                                className="w-full rounded-lg border border-[#e4d9cb] bg-white px-4 py-3 font-serif text-xl text-[#302820] outline-none transition placeholder:text-[#b5a99c] focus:border-[#a45b37]"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="article-category"
                                className="mb-2 block text-sm font-semibold text-[#514438]"
                            >
                                Category
                            </label>

                            <select
                                id="article-category"
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="w-full rounded-lg border border-[#e4d9cb] bg-white px-4 py-3 text-sm text-[#514438] outline-none focus:border-[#a45b37]"
                            >
                                {categories.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="article-content"
                                className="mb-2 block text-sm font-semibold text-[#514438]"
                            >
                                Your story
                            </label>

                            <textarea
                                id="article-content"
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                maxLength={20000}
                                rows={12}
                                placeholder="Start writing your thoughts, ideas and experiences..."
                                className="min-h-[280px] w-full resize-y rounded-lg border border-[#e4d9cb] bg-white px-4 py-4 text-[15px] leading-7 text-[#40372e] outline-none transition placeholder:text-[#b5a99c] focus:border-[#a45b37]"
                            />

                            <p className="mt-2 text-right text-xs text-[#948679]">
                                {content.length.toLocaleString()} / 20,000 characters
                            </p>
                        </div>

                        <div>
                            <p className="mb-2 block text-sm font-semibold text-[#514438]">
                                Cover image <span className="font-normal text-[#948679]">(optional)</span>
                            </p>

                            {preview ? (
                                <div className="relative overflow-hidden rounded-xl border border-[#e4d9cb]">
                                    <img
                                        src={preview}
                                        alt="Article cover preview"
                                        className="max-h-64 w-full object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-[#302820]/85 px-3 py-2 text-xs font-medium text-white transition hover:bg-[#302820]"
                                    >
                                        <Trash2 size={14} />
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="article-image"
                                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#cdbba8] bg-[#f4eee5] px-5 py-8 text-center transition hover:border-[#a45b37] hover:bg-[#f0e7db]"
                                >
                                    <ImagePlus size={27} className="mb-3 text-[#a45b37]" />
                                    <span className="text-sm font-semibold text-[#514438]">
                                        Add a cover image
                                    </span>
                                    <span className="mt-1 text-xs text-[#948679]">
                                        JPG, PNG or WEBP · Maximum 5 MB
                                    </span>
                                </label>
                            )}

                            <input
                                id="article-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-[#e8dfd4] bg-[#f6f1e9] px-6 py-4">
                        <div className="hidden items-center gap-2 text-xs text-[#948679] sm:flex">
                            <FileText size={16} />
                            Take your time. Make it worth reading.
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="ml-auto flex items-center gap-2 rounded-lg bg-[#a45b37] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#87472b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle size={17} className="animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Publish article
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePostModal;
