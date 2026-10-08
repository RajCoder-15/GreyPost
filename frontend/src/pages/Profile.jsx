import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostCard from "../Components/PostCard";

function Profile() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    
    useEffect(() =>{
        async function checkAuth(){
            const response = await fetch("http://localhost:3000/me",{
                credentials: "include"
            })
            if(!response.ok){
                navigate("/login");
            }else{
                
                const profileResponse = await fetch("http://localhost:3000/profile", {
                    credentials : "include",
                })
                const data = await profileResponse.json();
                console.log(data);
                setProfile(data);
                setLoading(false);
            }
        }
        checkAuth();
    },[])

    const [posts, setPosts] = useState([
        {
            id: 1,
            username: "Raj",
            image: "https://images.unsplash.com/photo-1500534623283-312aade485b7",
            caption: "Exploring something new today 🚀"
        },
        {
            id: 2,
            username: "Raj",
            image: "",
            caption: "This is my second post on GreyPost."
        }
    ]);

    const [editingPost, setEditingPost] = useState(null);
    const [editCaption, setEditCaption] = useState("");

    async function deletePost(id) {
        const response = await fetch(`http://localhost:3000/delete/${id}`,{
            method: "DELETE",
            credentials:"include"
        })
        if(response.ok){
            setProfile({
                ...profile,
                user: {
                    ...profile.user,
                    posts: profile.user.posts.filter(
                        (post) => post._id !== id
                    )
                }
            });
        }
    }

    function startEdit(post) {
        setEditingPost(post);
        setEditCaption(post.content);
    }

   async function updatePost(e) {
        e.preventDefault();

        const response = await fetch(`http://localhost:3000/update/${editingPost._id}`,{
            method: "PUT",
            credentials: "include",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                content:editCaption
            })
        })

        if (response.ok) {
            setProfile({
                ...profile,
                user: {
                    ...profile.user,
                    posts: profile.user.posts.map((post) =>
                        post._id === editingPost._id
                        ? { ...post, content: editCaption }
                        : post
                    )
                }
            });
        }    

        

        setEditingPost(null);
        setEditCaption("");
    }

    if (loading) {
        return(
            <div className="min-h-screen bg-zinc-900"></div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white">

            <div className="max-w-3xl mx-auto px-6 py-10">

                <div className="flex items-center justify-between">

                    <div className="flex items-center gap-6">

                        <div className="w-24 h-24 rounded-full bg-zinc-700"></div>

                        <div>
                            <h1 className="text-2xl font-bold">
                                {profile.user.name}
                            </h1>

                            <p className="text-zinc-400">
                                @{profile.user.username}
                            </p>

                            <p className="text-zinc-400 mt-2">
                                Developer | Creator | Student
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={() => navigate("/edit-profile")}
                        className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
                    >
                        Edit Profile
                    </button>

                </div>

                <div className="flex gap-10 mt-8 border-y border-zinc-800 py-5">

                    <div>
                        <p className="font-bold">{posts.length}</p>
                        <p className="text-sm text-zinc-500">
                            Posts
                        </p>
                    </div>

                    <div>
                        <p className="font-bold">{profile.user.followers.length}</p>
                        <p className="text-sm text-zinc-500">
                            Followers
                        </p>
                    </div>

                    <div>
                        <p className="font-bold">{profile.user.following.length}</p>
                        <p className="text-sm text-zinc-500">
                            Following
                        </p>
                    </div>

                </div>

                <div className="mt-8">

                    <h2 className="text-xl font-semibold mb-4">
                        My Posts
                    </h2>

                    {profile.user.posts.map((post) => (

                        <div key={post.id}>

                            <PostCard
                                username={post.user.username}
                                caption={post.content}
                            />

                            <div className="flex gap-4 justify-end pb-4">

                                <button
                                    onClick={() => startEdit(post)}
                                    className="flex items-center gap-2 text-zinc-400 hover:text-white"
                                >
                                    <Pencil size={18} />
                                    Edit
                                </button>

                                <button
                                    onClick={() => deletePost(post._id)}
                                    className="flex items-center gap-2 text-red-400 hover:text-red-300"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

            {editingPost && (

                <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4">

                    <div className="w-full max-w-lg bg-zinc-900 rounded-2xl p-6">

                        <h2 className="text-xl font-semibold mb-6">
                            Edit Post
                        </h2>

                        <form onSubmit={updatePost}>

                            <textarea
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value)}
                                className="w-full h-32 resize-none bg-zinc-800 text-white rounded-xl p-4 outline-none"
                            />

                            <div className="flex gap-3 mt-5">

                                <button
                                    type="button"
                                    onClick={() => setEditingPost(null)}
                                    className="flex-1 py-3 rounded-xl bg-zinc-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-white text-black font-semibold"
                                >
                                    Update
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Profile;