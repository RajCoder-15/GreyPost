import Navbar from "../Components/Navbar";
import PostCard from "../Components/PostCard";

function Home() {

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