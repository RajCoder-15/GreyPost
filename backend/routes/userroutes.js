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
    unfollowUser
} = require("../controllers/usercontroller");



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

module.exports = router;