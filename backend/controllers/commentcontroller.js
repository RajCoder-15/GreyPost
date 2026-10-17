
const commentModel = require("../models/comment");
const postModel = require("../models/post");

const createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;
        const userId = req.user.userid;

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const post = await postModel.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = await commentModel.create({
            post: postId,
            user: userId,
            content: content.trim()
        });

        await comment.populate("user", "username name profilepic");

        return res.status(201).json({
            message: "Comment added successfully",
            comment
        });
    } catch (error) {
        console.error("Create comment error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        return res.status(500).json({
            message: "Failed to add comment"
        });
    }
};

const getComments = async (req, res) => {
    try {
        const postId = req.params.postId;

        const post = await postModel.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comments = await commentModel
            .find({ post: postId })
            .populate("user", "username name profilepic")
            .sort({ date: -1 });

        return res.status(200).json({ comments });

    } catch (error) {
        console.error("Get comments error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid post ID"
            });
        }

        return res.status(500).json({
            message: "Failed to fetch comments"
        });
    }
};

module.exports = { createComment, getComments };
