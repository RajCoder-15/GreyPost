const mongoose = require ('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/projectdb");

const postSchema = mongoose.Schema({
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type:Date,
        default:Date.now
    },
    content:String,
    image: {
        type: String,
        default: ""
    },
    likes: [
        {type:mongoose.Schema.Types.ObjectId,ref:"user"}
    ]

})

module.exports = mongoose.model('post', postSchema);