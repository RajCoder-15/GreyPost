import Navbar from "../Components/Navbar";
import PostCard from "../Components/PostCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth(){
            const response = await fetch("http://localhost:3000/me",{
                credentials: "include"
            });
            console.log("AUTH STATUS:", response.status);

            
            if(!response.ok) {
                navigate("/login");
            }else{
                setLoading(false);
            }
        }
        checkAuth();
    }, []);

    const posts = [
        {
            id: 1,
            username: "Raj",
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
            caption: "Exploring something new today 🚀"
        },
        {
            id: 2,
            username: "Aman",
            image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
            caption: "Beautiful day!"
        },
        {
            id: 3,
            username: "Rahul",
            image: "",
            caption: "This is a text-only post."
        }
    ];

    if (loading) {
    return(
         <div className="min-h-screen bg-zinc-900"></div>
        );
    }

    return (
        <div className="bg-zinc-900 min-h-screen text-white">

            <Navbar />

            <main className="py-8">

                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        username={post.username}
                        image={post.image}
                        caption={post.caption}
                    />
                ))}

            </main>

        </div>
    );
}

export default Home;