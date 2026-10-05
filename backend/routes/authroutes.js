const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout
} = require("../controllers/authcontroller");


router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/register", register);

router.post("/login", login);

router.get("/logout", logout);


module.exports = router;