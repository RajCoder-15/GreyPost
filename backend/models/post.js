
const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/projectdb");

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    title: {
        type: String,
        trim: true,
        default: ""
    },
    content: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        enum: [
            "Technology",
            "Productivity",
            "Lifestyle",
            "Education",
            "Travel",
            "Personal",
            "Other"
        ],
        default: "Personal"
    },
    date: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String,
        default: ""
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
});

module.exports = mongoose.model("post", postSchema);
