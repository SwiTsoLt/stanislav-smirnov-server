const { Schema, model } = require('mongoose');

const User = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: [{ type: String, ref: 'Role' }],
    likedPosts: [{ type: String }],
    commentedPosts: [{ type: String }],
    avatarName: { type: String }
})

module.exports = model('User', User)