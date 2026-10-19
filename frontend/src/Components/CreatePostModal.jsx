
import { useEffect, useState } from "react";
import {
  X,
  ImagePlus,
  Send,
  LoaderCircle,
  AlertCircle,
  FileText,
  Trash2,
} from "lucide-react";

function CreatePostModal({ onClose, onPostCreated }) {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!preview) return;

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
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

    const input = document.getElementById("post-image");

    if (input) {
      input.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

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
      const response = await fetch("http://localhost:3000/post", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to create post.");
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-3 py-6 backdrop-blur-sm sm:px-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="relative my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#121218] shadow-2xl shadow-black/50"
      >
        <div className="relative overflow-hidden border-b border-white/[0.07] bg-gradient-to-br from-violet-950/70 via-[#211a32] to-[#121218] px-5 py-5 sm:px-7 sm:py-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full border border-violet-300/10 bg-violet-400/[0.04]"
          />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0">
                <h2
                  id="create-post-title"
                  className="text-xl font-bold tracking-tight text-white sm:text-2xl"
                >
                  Create a Post
                </h2>

                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
                  Share what's on your mind.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              aria-label="Close modal"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-7">
          <div className="mb-3 flex items-center gap-2">
            <FileText size={16} className="text-violet-300" />
            <label
              htmlFor="post-caption"
              className="text-sm font-medium text-zinc-200"
            >
              Your thoughts
            </label>
          </div>

          <textarea
            id="post-caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="What's happening in your world?"
            rows={5}
            maxLength={2000}
            disabled={loading}
            className="w-full resize-y rounded-2xl border border-white/[0.09] bg-[#0b0b10] px-4 py-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.15] focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/[0.08] disabled:opacity-60"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-zinc-500">
              Every thought deserves a space.
            </p>

            <span className="shrink-0 text-xs tabular-nums text-zinc-500">
              {caption.length}/2000
            </span>
          </div>

          {preview && (
            <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]">
              <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
                <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-300">
                  <ImagePlus
                    size={16}
                    className="shrink-0 text-violet-300"
                  />
                  <span className="truncate">{image?.name}</span>
                </div>

                <button
                  type="button"
                  onClick={removeImage}
                  disabled={loading}
                  aria-label="Remove selected image"
                  title="Remove image"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <img
                src={preview}
                alt="Selected post preview"
                className="max-h-80 w-full object-contain"
              />
            </div>
          )}

          <div className="mt-5">
            <input
              id="post-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              className="hidden"
            />

            <label
              htmlFor="post-image"
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-violet-400/25 bg-violet-500/[0.04] p-4 transition hover:border-violet-400/50 hover:bg-violet-500/[0.08] ${
                loading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-300">
                <ImagePlus size={21} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-200">
                  {image ? "Change image" : "Add an image"}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  PNG, JPG, GIF or other image formats · Max 5 MB
                </p>
              </div>

              <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300">
                Browse
              </span>
            </label>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-3.5"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <p className="min-w-0 flex-1 break-words text-sm leading-5 text-red-300">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="shrink-0 text-red-400 transition hover:text-red-200"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}

              {loading ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;
