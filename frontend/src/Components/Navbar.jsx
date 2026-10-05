import { useState } from "react";
import { Plus } from "lucide-react";
import SearchBar from "./SearchBar";
import CreatePostModal from "./CreatePostModal";

function Navbar() {

    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <nav className="w-full flex items-center justify-between px-8 py-4">

                <h1 className="text-2xl font-bold">
                    GreyPost
                </h1>

                <SearchBar />

                <div className="flex items-center gap-6">

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 text-white"
                    >
                        <Plus size={20} />
                        Create
                    </button>

                    <button className="text-white">
                        Profile
                    </button>

                </div>

            </nav>

            {showModal && (
                <CreatePostModal
                    onClose={() => setShowModal(false)}
                />
            )}

        </>
    );
}

export default Navbar;