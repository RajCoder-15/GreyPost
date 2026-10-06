const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {

    if (!req.cookies.token) {
        return res.status(401).json("you should login first");
    }

    try {

        let data = jwt.verify(
            req.cookies.token,
            process.env.JWT_SECRET
        );

        req.user = data;

        next();

    } catch (err) {

        res.cookie("token", "");

        res.status(401).json("you should login first");
        
    }
}

module.exports = isLoggedIn;