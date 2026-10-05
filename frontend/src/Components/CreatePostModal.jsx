import { useState } from "react";
import { X, ImagePlus } from "lucide-react";

function CreatePostModal({ onClose }) {

    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");

    function handleImageChange(e) {
        const file = e.target.files[0];

        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    function handleSubmit(e) {
        e.preventDefault();

        console.log("Caption:", caption);
        console.log("Image:", image);

        setCaption("");
        setImage(null);
        setPreview("");
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4">

            <div className="w-full max-w-lg bg-zinc-900 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-6">

                    <h2 className="text-xl font-semibold text-white">
                        Create Post
                    </h2>

                    <button
                        onClick={onClose}
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
                        className="w-full h-32 resize-none bg-zinc-800 text-white rounded-xl p-4 outline-none"
                    />

                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full max-h-72 object-cover rounded-xl mt-4"
                        />
                    )}

                    <label className="flex items-center gap-2 mt-4 text-zinc-400 cursor-pointer">
                        <ImagePlus size={20} />
                        Add Image

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>

                    <button
                        type="submit"
                        className="w-full mt-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200"
                    >
                        Post
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreatePostModal;