require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();



const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");



app.set("view engine", "ejs");



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", postRoutes);



app.get("/", (req, res) => {
    res.render("index");
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});