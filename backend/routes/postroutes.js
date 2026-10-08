const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");

const {
    createPost,
    likePost,
    updatePost,
    deletePost,
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

router.put(
    "/update/:id",
    isLoggedIn,
    updatePost
);

router.delete("/delete/:id", isLoggedIn, deletePost);
router.get("/getFeed", isLoggedIn, getFeed);


module.exports = router;