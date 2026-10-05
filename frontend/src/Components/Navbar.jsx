import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import CreatePostModal from "./CreatePostModal";

function Navbar() {

    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    return (
        <>
            <nav className="w-full flex items-center justify-between px-8 py-4">

                <button
                    onClick={() => navigate("/")}
                    className="text-2xl font-bold"
                >
                    GreyPost
                </button>

                <SearchBar />

                <div className="flex items-center gap-6">

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 text-white"
                    >
                        <Plus size={20} />
                       
                    </button>

                    <button
                        onClick={() => navigate("/profile")}
                        className="text-white"
                    >
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