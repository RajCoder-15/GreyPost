const postModel = require("../models/post");
const userModel = require("../models/user");


const createPost = async (req, res) => {

    let user = await userModel.findOne({
        email: req.user.email
    });

    let { content } = req.body;

    let post = await postModel.create({
        user: user._id,
        content
    });

    user.posts.push(post._id);

    await user.save();

    res.redirect("/profile");
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

        const alreadyLiked = post.likes.some(
            (id) => id.toString() === userId
        );

        if (alreadyLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
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
        return res.status(500).json({
            message: "Failed to update like"
        });
    }
};


const updatePost = async (req, res) => {

    await postModel.findOneAndUpdate(
        { _id: req.params.id },
        {
            content: req.body.content
        }
    );

    res.status(200).json({
        message: "Post updated successfully"
    });
};

const deletePost = async(req, res) => {
    await postModel.findOneAndDelete(
        {_id: req.params.id},
    )
    await userModel.findOneAndUpdate(
        {_id:req.params.id},
        {
            $pull: {
                posts: req.user.userid
            }
        }
    )
    res.status(200).json({
        message: "Post deleted successfully"
    });

}

const getFeed = async (req, res) => {
    let user = await userModel.findById(req.user.userid);
    let users = [
        req.user.userid,
        ...user.following
    ];

    let posts = await postModel.find({
        user: { $in: users}
    });
    
    res.json(posts);

}


module.exports = {
    createPost,
    likePost,
    updatePost,
    deletePost,
    getFeed
};