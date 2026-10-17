const userModel = require("../models/user");


const getProfile = async (req, res) => {

    let user = await userModel
        .findOne({ email: req.user.email }).select("-password")
        .populate({
            path: "posts",
            populate:{
                path: "user",
                select: "-password"
            }
        })

    let currentUser = await userModel.findOne({
        _id: req.user.userid
    }).select("-password");

    res.status(200).json({
        user,
        currentUser
    });
};



const getUserProfile = async (req, res) => {

    let user = await userModel
        .findOne({ username: req.params.username })
        .select("-password")
        .populate({
            path: "posts",
            populate: {
                path: "user",
                select: "-password"
            }
        });

    

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    let currentUser = await userModel.findById(req.user.userid).select("-password");

    res.status(200).json({
        user,
        currentUser
    });
};

const searchUsers = async (req, res) => {
    try {
        const query = req.query.q?.trim();

        if (!query) {
            return res.status(400).json({
                message: "Search query is required"
            });
        }

        const users = await userModel
            .find({
                $or: [
                    { username: { $regex: query, $options: "i" } },
                    { name: { $regex: query, $options: "i" } }
                ]
            })
            .select("username name profilepic")
            .limit(10);

        return res.status(200).json({ users });

    } catch (error) {
        console.error("Search users error:", error);

        return res.status(500).json({
            message: "Failed to search users"
        });
    }
};



const profileUploadPage = (req, res) => {
    res.render("profileupload");
};


const uploadProfile = async (req, res) => {

    let user = await userModel.findOne({
        email: req.user.email
    });

    user.profilepic = req.file.filename;

    await user.save();

    res.redirect("/profile");
};


const followUser = async (req, res) => {

    let currentUser = await userModel.findById(
        req.user.userid
    );

    let userToFollow = await userModel.findById(
        req.params.id
    );

    if (!userToFollow) {
        return res.status(404).send("User not found");
    }

    if (
        currentUser._id.toString() ===
        userToFollow._id.toString()
    ) {
        return res.status(400).send("You cannot follow yourself");
    }

    if (
        !currentUser.following.some(
            id => id.toString() === userToFollow._id.toString()
        )
    ) {

        currentUser.following.push(userToFollow._id);

        userToFollow.followers.push(currentUser._id);

        await currentUser.save();
        await userToFollow.save();
    }

    res.status(200).json({
        message: "User followed successfully"
    });
};


const unfollowUser = async (req, res) => {

    let currentUser = await userModel.findById(
        req.user.userid
    );

    let userToUnfollow = await userModel.findById(
        req.params.id
    );

    if (!userToUnfollow) {
        return res.status(404).send("User not found");
    }

    currentUser.following.pull(userToUnfollow._id);

    userToUnfollow.followers.pull(currentUser._id);

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({
        message: "User Unfollowed successfully"
    });
};


const updateProfile = async (req, res) => {
    try {
        const { name, username, bio } = req.body;

        if (
            typeof name !== "string" ||
            typeof username !== "string" ||
            typeof bio !== "string"
        ) {
            return res.status(400).json({
                message: "Name, username and bio are required"
            });
        }

        const cleanName = name.trim();
        const cleanUsername = username.trim();
        const cleanBio = bio.trim();

        if (!cleanName || !cleanUsername) {
            return res.status(400).json({
                message: "Name and username cannot be empty"
            });
        }

        if (cleanBio.length > 160) {
            return res.status(400).json({
                message: "Bio cannot exceed 160 characters"
            });
        }

        const existingUser = await userModel.findOne({
            username: cleanUsername,
            _id: { $ne: req.user.userid }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username is already taken"
            });
        }

        const user = await userModel.findByIdAndUpdate(
            req.user.userid,
            {
                $set: {
                    name: cleanName,
                    username: cleanUsername,
                    bio: cleanBio
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        console.error("Update profile error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username is already taken"
            });
        }

        return res.status(500).json({
            message: "Failed to update profile"
        });
    }
};



module.exports = {
    getProfile,
    getUserProfile,
    profileUploadPage,
    uploadProfile,
    followUser,
    unfollowUser,
    searchUsers,
    updateProfile
};