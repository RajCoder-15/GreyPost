import { useState } from "react";
import { useNavigate } from "react-router-dom";

function EditProfile() {

    const navigate = useNavigate();

    const [name, setName] = useState("Raj");
    const [username, setUsername] = useState("raj");
    const [bio, setBio] = useState("Developer | Creator | Student");

    function handleSubmit(e) {
        e.preventDefault();

        console.log({
            name,
            username,
            bio
        });

        navigate("/profile");
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-4">

            <div className="w-full max-w-lg bg-zinc-800 rounded-2xl p-8">

                <h1 className="text-2xl font-bold mb-6">
                    Edit Profile
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                            Name
                        </label>

                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-900 rounded-xl px-4 py-3 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                            Username
                        </label>

                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-zinc-900 rounded-xl px-4 py-3 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-zinc-400 mb-2">
                            Bio
                        </label>

                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full h-28 resize-none bg-zinc-900 rounded-xl px-4 py-3 outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">

                        <button
                            type="button"
                            onClick={() => navigate("/profile")}
                            className="flex-1 py-3 rounded-xl bg-zinc-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-white text-black font-semibold"
                        >
                            Save Changes
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditProfile;