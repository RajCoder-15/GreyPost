
const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");
const { createComment, getComments } = require("../controllers/commentcontroller");

router.post("/:postId", isLoggedIn, createComment);
router.get("/:postId", isLoggedIn, getComments);

module.exports = router;
