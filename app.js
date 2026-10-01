require("dotenv").config();

const express = require('express');
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('./config/multerconfig');
const path = require('path');



app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));



app.get("/", (req,res) => {
    res.render("index");
})

app.get("/profile/upload", (req,res) => {
    res.render("profileupload");
});

app.post("/upload",isLoggedIn, upload.single("image"), async (req,res) => {
    let user = await userModel.findOne({email:req.user.email});
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
})


app.get("/login",(req,res) => {
    
    res.render("login");
})

app.get("/profile", isLoggedIn, async (req,res) => {
   let user = await userModel.findOne({email:req.user.email}).populate("posts");
   let currentUser = await userModel.findOne({_id: req.user.userid});
    res.render("profile", {user, currentUser});
})
app.get("/profile/:username", isLoggedIn, async (req, res) => {

    let user = await userModel
        .findOne({ username: req.params.username })
        .populate("posts");

    let currentUser = await userModel.findOne({
        _id: req.user.userid
    });

    if (!user) {
        return res.status(404).send("User not found");
    }

    res.render("profile", {
        user,
        currentUser
    });
});

app.get("/like/:id", isLoggedIn, async (req,res) => {
   let post = await postModel.findOne({_id: req.params.id}).populate("user");
   if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
   }
   else{
    post.likes.splice(post.likes.indexOf(req.user.userid),1);
   }
   
   await post.save();
    res.redirect("/profile");
})

app.get("/edit/:id", isLoggedIn, async (req,res) => {
   let post = await postModel.findOne({_id: req.params.id}).populate("user");
    res.render("edit",{post});
})

app.post("/update/:id", isLoggedIn, async (req,res) => {
   let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content:req.body.content})
    res.redirect("/profile");
})

app.post("/post", isLoggedIn, async (req,res) => {
   let user = await userModel.findOne({email:req.user.email});
   let {content} = req.body;
   let post = await postModel.create({
    user:user._id,
    content
   });

   user.posts.push(post._id);
   await user.save();
   res.redirect("/profile");
    
})

app.post("/register", async (req,res) => {
    let {email, password, name, username, age} = req.body;
    let user = await userModel.findOne({
        $or: [
            {email: email},
            {username:username}
        ]
    });
    if(user) return res.status(500).send("email or username already exist");

    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(password, salt, async (err,hash)=>{
            let user = await userModel.create ({
                username,
                name,
                email,
                age,
                password:hash
            });

            let token = jwt.sign({email:email, userid: user._id}, process.env.JWT_SECRET);
            res.cookie("token", token);
            res.redirect("/login");
        })
    })
});
app.post("/login", async (req,res) => {
    let {email, password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("email or password is incorrect");

    bcrypt.compare(password, user.password, (err, result) =>{
        if(result){
            let token = jwt.sign({email:email, userid: user._id}, process.env.JWT_SECRET);
            res.cookie("token", token);
            res.status(200).redirect("/profile");
        } 
        else res.redirect("/login");
    })
});

app.get("/logout", (req,res) => {
    res.cookie("token", "");
    res.redirect("/login");
})

function isLoggedIn(req,res,next){
   if (!req.cookies.token) {
        return res.redirect("/login");
    }
    try {
       let data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
       req.user = data;
       next();
    } catch (err) {
        res.cookie("token", "");
        return res.redirect("/login");
    }
        
}
app.get("/follow/:id", isLoggedIn, async (req, res) => {

    let currentUser = await userModel.findById(req.user.userid);
    let userToFollow = await userModel.findById(req.params.id);

    if (!userToFollow) {
        return res.status(404).send("User not found");
    }

    if (currentUser._id.toString() === userToFollow._id.toString()) {
        return res.status(400).send("You cannot follow yourself");
    }

    if (!currentUser.following.some(
        id => id.toString() === userToFollow._id.toString()
    )) {

        currentUser.following.push(userToFollow._id);
        userToFollow.followers.push(currentUser._id);

        await currentUser.save();
        await userToFollow.save();
    }

    res.redirect("/profile/" + userToFollow.username);
});

app.get("/unfollow/:id", isLoggedIn, async (req, res) => {

    let currentUser = await userModel.findById(req.user.userid);
    let userToUnfollow = await userModel.findById(req.params.id);

    if (!userToUnfollow) {
        return res.status(404).send("User not found");
    }

    currentUser.following.pull(userToUnfollow._id);
    userToUnfollow.followers.pull(currentUser._id);

    await currentUser.save();
    await userToUnfollow.save();

    res.redirect("/profile/" + userToUnfollow.username);
});


app.listen(3000);

