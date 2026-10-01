const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {

    if (!req.cookies.token) {
        return res.redirect("/login");
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

        return res.redirect("/login");
    }
}

module.exports = isLoggedIn;