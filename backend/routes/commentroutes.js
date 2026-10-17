
const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/authmiddleware");
const { createComment } = require("../controllers/commentcontroller");

router.post("/:postId", isLoggedIn, createComment);

module.exports = router;
