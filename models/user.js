const mongoose = require ('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/projectdb");

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    }, 

    name:{
        type: String,
        required: true
    }, 

    email:{
        type: String,
        required:  true, 
        unique:true
    },

    password:{
        type: String,
        required: true
    },

    age:{
        type: Number,
        required: true
    },

    profilepic:{
        type: String,
        default: "default.webp"
    },
    
    posts:[
        {type:mongoose.Schema.Types.ObjectId, ref:"post"}
    ],

    followers: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
    ],

    following: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
    ]
})

module.exports = mongoose.model('user', userSchema);