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

    let post = await postModel
        .findOne({ _id: req.params.id })
        .populate("user");

    if (post.likes.indexOf(req.user.userid) === -1) {

        post.likes.push(req.user.userid);

    } else {

        post.likes.splice(
            post.likes.indexOf(req.user.userid),
            1
        );
    }

    await post.save();

    res.redirect("/profile");
};


const editPost = async (req, res) => {

    let post = await postModel
        .findOne({ _id: req.params.id })
        .populate("user");

    res.render("edit", { post });
};



const updatePost = async (req, res) => {

    await postModel.findOneAndUpdate(
        { _id: req.params.id },
        {
            content: req.body.content
        }
    );

    res.redirect("/profile");
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
    editPost,
    updatePost,
    deletePost,
    getFeed
};