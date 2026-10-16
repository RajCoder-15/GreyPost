const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");
const upload = require("../middleware/uploadmiddleware");

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
    upload.single("image"),
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