const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/auth.middleware");

const {
    createPost,
    likePost,
    editPost,
    updatePost
} = require("../controllers/post.controller");



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


module.exports = router;