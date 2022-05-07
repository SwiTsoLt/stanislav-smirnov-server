const { Schema, model } = require('mongoose')

const Post = new Schema({
    title: { type: String, required: true, unique: false },
    imageName: { type: String },
    body: { type: String, unique: false, sparse: true },
    likes: [{ type: String }],
    comments: [{ type: Object }]
})

module.exports = model('Post', Post)