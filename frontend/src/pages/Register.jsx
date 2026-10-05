import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [age, setAge] = useState("");
    const [password, setPassword] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        console.log({
            name,
            username,
            email,
            age,
            password
        });

        navigate("/login");
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-4">

            <div className="w-full max-w-md bg-zinc-800 rounded-2xl p-8">

                <h1 className="text-2xl font-bold">
                    Create Account
                </h1>

                <p className="text-zinc-400 mt-2 mb-6">
                    Join GreyPost today
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900 rounded-xl px-4 py-3 outline-none"
                    />

                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-zinc-900 rounded-xl px-4 py-3 outline-none"
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-900 rounded-xl px-4 py-3 outline-none"
                    />

                    <input
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
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
                        Create Account
                    </button>

                </form>

                <p className="text-center text-zinc-400 mt-6">
                    Already have an account?
                    <button
                        onClick={() => navigate("/login")}
                        className="text-white ml-2"
                    >
                        Login
                    </button>
                </p>

            </div>

        </div>
    );
}

export default Register;