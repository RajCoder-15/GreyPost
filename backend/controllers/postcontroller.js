
const postModel = require("../models/post");
const userModel = require("../models/user");
const notificationModel = require("../models/notification");

const allowedCategories = [
    "Technology",
    "Productivity",
    "Lifestyle",
    "Education",
    "Travel",
    "Personal",
    "Other"
];

const createPost = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userid);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const title = req.body.title?.trim() || "";
        const content = req.body.content?.trim() || "";
        const category = req.body.category || "Personal";

        if (!title) {
            return res.status(400).json({
                message: "Article title is required"
            });
        }

        if (!content) {
            return res.status(400).json({
                message: "Article content is required"
            });
        }

        if (!allowedCategories.includes(category)) {
            return res.status(400).json({
                message: "Invalid article category"
            });
        }

        const image = req.file
            ? `/images/${req.file.filename}`
            : "";

        const post = await postModel.create({
            user: user._id,
            title,
            content,
            category,
            image
        });

        user.posts.push(post._id);
        await user.save();

        return res.status(201).json({
            message: "Article published successfully",
            post
        });
    } catch (error) {
        console.error("Create article error:", error);

        return res.status(500).json({
            message: "Failed to publish article"
        });
    }
};

const likePost = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user.userid.toString();
        const postOwnerId = post.user.toString();

        const alreadyLiked = post.likes.some(
            id => id.toString() === userId
        );

        if (alreadyLiked) {
            post.likes.pull(userId);

            await notificationModel.deleteOne({
                recipient: postOwnerId,
                sender: userId,
                type: "like",
                post: post._id
            });
        } else {
            post.likes.push(userId);

            if (userId !== postOwnerId) {
                await notificationModel.create({
                    recipient: postOwnerId,
                    sender: userId,
                    type: "like",
                    post: post._id
                });
            }
        }

        await post.save();

        return res.status(200).json({
            message: alreadyLiked
                ? "Post unliked successfully"
                : "Post liked successfully",
            likes: post.likes,
            liked: !alreadyLiked
        });
    } catch (error) {
        console.error("Like post error:", error);

        return res.status(500).json({
            message: "Failed to update like"
        });
    }
};

const updatePost = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Article not found"
            });
        }

        if (post.user.toString() !== req.user.userid.toString()) {
            return res.status(403).json({
                message: "You can only edit your own articles"
            });
        }

        const { title, content, category } = req.body;

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    message: "Article title cannot be empty"
                });
            }

            post.title = title.trim();
        }

        if (content !== undefined) {
            if (!content.trim()) {
                return res.status(400).json({
                    message: "Article content cannot be empty"
                });
            }

            post.content = content.trim();
        }

        if (category !== undefined) {
            if (!allowedCategories.includes(category)) {
                return res.status(400).json({
                    message: "Invalid article category"
                });
            }

            post.category = category;
        }

        await post.save();

        return res.status(200).json({
            message: "Article updated successfully",
            post
        });
    } catch (error) {
        console.error("Update article error:", error);

        return res.status(500).json({
            message: "Failed to update article"
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await postModel.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Article not found"
            });
        }

        if (post.user.toString() !== req.user.userid.toString()) {
            return res.status(403).json({
                message: "You can only delete your own articles"
            });
        }

        await postModel.findByIdAndDelete(req.params.id);

        await userModel.findByIdAndUpdate(
            req.user.userid,
            {
                $pull: { posts: post._id }
            }
        );

        return res.status(200).json({
            message: "Article deleted successfully"
        });
    } catch (error) {
        console.error("Delete article error:", error);

        return res.status(500).json({
            message: "Failed to delete article"
        });
    }
};

const getFeed = async (req, res) => {
    try {
        const currentUser = await userModel
            .findById(req.user.userid)
            .select("-password");

        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const followingIds = currentUser.following.map(
            id => id.toString()
        );

        const posts = await postModel
            .find({})
            .populate("user", "username name profilepic")
            .sort({ date: -1 });

        const followingPosts = [];
        const otherPosts = [];

        posts.forEach(post => {
            const authorId = post.user?._id?.toString();

            if (followingIds.includes(authorId)) {
                followingPosts.push(post);
            } else {
                otherPosts.push(post);
            }
        });

        const sortedPosts = [
            ...followingPosts,
            ...otherPosts
        ];

        return res.status(200).json({
            posts: sortedPosts,
            currentUserId: currentUser._id,
            following: currentUser.following
        });
    } catch (error) {
        console.error("Get feed error:", error);

        return res.status(500).json({
            message: "Failed to load feed"
        });
    }
};

module.exports = {
    createPost,
    likePost,
    updatePost,
    deletePost,
    getFeed
};
