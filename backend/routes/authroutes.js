const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middleware/authmiddleware");

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

router.get("/me", isLoggedIn, (req,res)=>{
    res.status(200).json(req.user);
})


module.exports = router;