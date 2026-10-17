
const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");
const { createComment, getComments, deleteComment } = require("../controllers/commentcontroller");

router.post("/:postId", isLoggedIn, createComment);
router.get("/:postId", isLoggedIn, getComments);
router.delete("/item/:commentId", isLoggedIn, deleteComment);

module.exports = router;
