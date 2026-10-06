import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await fetch("http://localhost:3000/login",
        {
            method: "POST",

            headers:{
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({
                email,
                password
            })
        });

        if(response.ok) {
                navigate("/");
            }else {
                const message = await response.text();
                setError(message);
            }
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-zinc-800 rounded-2xl p-8">


                <p className="text-zinc-400 mt-2 mb-6">
                    Login to your GreyPost account
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-900 rounded-xl px-4 py-3 outline-none"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-900 rounded-xl px-4 py-3 outline-none"
                    />

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-white text-black font-semibold"
                    >
                        Login
                    </button>

                </form>

                <p className="text-center text-zinc-400 mt-6">

                    Don't have an account?

                    <button
                        onClick={() => navigate("/register")}
                        className="text-white ml-2"
                    >
                        Register
                    </button>

                </p>

            </div>

        </div>
    );
}

export default Login;