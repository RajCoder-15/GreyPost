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


module.exports = {
    getProfile,
    getUserProfile,
    profileUploadPage,
    uploadProfile,
    followUser,
    unfollowUser
};