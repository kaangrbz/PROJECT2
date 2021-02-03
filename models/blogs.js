const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    authority: {
        type: Number,
        require: true
    },
    userid: {
        type: Number,
        require: true
    },
    username: {
        type: String,
        require: true,
        unique: true,
    },
    userpass: {
        type: String,
        require: true,
    },
    fullname: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    biography: {
        type: String,
        default: '',
        maxlength: 1000
    },
    visibility: {
        type: Boolean,
        default: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    suspend: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date,
        required: false
    },
})

const User = mongoose.model('User', userSchema);

const postSchema = new Schema({
    userid: {
        type: Number,
        required: true,
        unique: false,
    },
    postid: {
        type: Number,
        required: true,
        unique: true,
    },
    article: {
        type: String,
        required: false,
    },
    attacments: {
        type: Array,
        required: false,
        default: []
    },
    visibility: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    updatedAt: {
        type: Date,
        required: false,
    },
})

const Post = mongoose.model('Post', postSchema);

const countSchema = new Schema({
    users: {
        type: Number,
        default: 0
    },
    posts: {
        type: Number,
        default: 0
    }
})

const Count = mongoose.model('Count', countSchema);

const utmSchema = new Schema({
    fromwhere: {
        type: String,
        require: true,
        unique: false
    },
    whoadded: {
        type: String,
        require: true
    },
    whichsite: {
        type: String,
        require: true
    },
}, {
    timestamps: true
})

const UTM = mongoose.model('UTM', utmSchema);


module.exports = {
    User,
    Post,
    Count,
    UTM,
}