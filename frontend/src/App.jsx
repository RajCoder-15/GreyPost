
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditProfile from "./pages/EditProfile";
import UserProfile from "./pages/userProfile";
import FollowList from "./pages/FollowList";
import Notifications from "./pages/Notifications";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/followers" element={<FollowList />} />
                <Route path="/profile/following" element={<FollowList />} />
                <Route path="/profile/:username" element={<UserProfile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/notifications" element={<Notifications />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
