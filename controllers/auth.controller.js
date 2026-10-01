const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const register = async (req, res) => {

    let { email, password, name, username, age } = req.body;

    let user = await userModel.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    });

    if (user) {
        return res.status(500).send("email or username already exist");
    }

    bcrypt.genSalt(10, (err, salt) => {

        bcrypt.hash(password, salt, async (err, hash) => {

            let user = await userModel.create({
                username,
                name,
                email,
                age,
                password: hash
            });

            let token = jwt.sign(
                {
                    email: email,
                    userid: user._id
                },
                process.env.JWT_SECRET
            );

            res.cookie("token", token);

            res.redirect("/login");
        });
    });
};


const login = async (req, res) => {

    let { email, password } = req.body;

    let user = await userModel.findOne({ email });

    if (!user) {
        return res.status(500).send("email or password is incorrect");
    }

    bcrypt.compare(password, user.password, (err, result) => {

        if (result) {

            let token = jwt.sign(
                {
                    email: email,
                    userid: user._id
                },
                process.env.JWT_SECRET
            );

            res.cookie("token", token);

            res.status(200).redirect("/profile");

        } else {
            res.redirect("/login");
        }
    });
};


const logout = (req, res) => {

    res.cookie("token", "");

    res.redirect("/login");
};


module.exports = {
    register,
    login,
    logout
};