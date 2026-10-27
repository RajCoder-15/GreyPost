const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");

const upload = require("../config/multerconfig");

const {
    getProfile,
    getUserProfile,
    profileUploadPage,
    uploadProfile,
    followUser,
    unfollowUser,
    searchUsers,
    updateProfile,
    uploadProfileImage,
    uploadCoverImage
} = require("../controllers/usercontroller");



router.get(
    "/search",
    isLoggedIn,
    searchUsers
);

router.get(
    "/profile",
    isLoggedIn,
    getProfile
);

router.get(
    "/profile/:username",
    isLoggedIn,
    getUserProfile
);

router.get(
    "/profile/upload",
    isLoggedIn,
    profileUploadPage
);

router.post(
    "/upload",
    isLoggedIn,
    upload.single("image"),
    uploadProfile
);

router.get(
    "/follow/:id",
    isLoggedIn,
    followUser
);

router.get(
    "/unfollow/:id",
    isLoggedIn,
    unfollowUser
);

router.post(
    "/profile/upload-picture",
    isLoggedIn,
    upload.single("image"),
    uploadProfileImage
);

router.post(
    "/profile/upload-cover",
    isLoggedIn,
    upload.single("image"),
    uploadCoverImage
);

router.put("/profile", isLoggedIn, updateProfile);

module.exports = router;