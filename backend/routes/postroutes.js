const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");

const {
    createPost,
    likePost,
    editPost,
    updatePost,
    getFeed
} = require("../controllers/postcontroller");



router.post(
    "/post",
    isLoggedIn,
    createPost
);



router.get(
    "/like/:id",
    isLoggedIn,
    likePost
);



router.get(
    "/edit/:id",
    isLoggedIn,
    editPost
);



router.post(
    "/update/:id",
    isLoggedIn,
    updatePost
);

router.get("/getFeed", isLoggedIn, getFeed);


module.exports = router;