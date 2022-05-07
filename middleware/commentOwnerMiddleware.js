const jwt = require('jsonwebtoken');
const config = require('config');
const Post = require('../models/Post');
const User = require('../models/User');
const Url = require('url');

module.exports = function commentOwnerMiddleware() {
    return async function (req, res, next) {
        req.method === "OPTIONS" && next()
        try {
            const token = req.headers.authorization?.split(' ')[1] || null
            if (token) {
                const url = Url.parse(req.url, true)

                const { id } = jwt.decode(token, config.get('jwtSecret'), (e) => {
                    if (e) {
                        res.status(403).json({ message: "User not authorized" })
                        return next()
                    }
                })

                const user = await User.findById(id)
                if (user) {
                    const post = await Post.findById(url.query.postId)
                    if (post) {
                        const currentComment = post.comments.filter( (comment, index) => {
                            index == url.query.commentIndex
                        })
                        if (currentComment) {
                            if(currentComment.username === user.username) {
                                return next()
                            }
                            res.status(403).json({ message: "The comment does not belong to the current user" })
                            return next()
                        }
                        res.status(403).json({ message: "Comment was not found" })
                        return next()
                    }
                    res.status(403).json({ message: "Post was not found" })
                    return next()
                }
                res.status(403).json({ message: "User was not found" })
                return next()
            }
            res.status(403).json({ message: "User not authorized" })
            return next()
        } catch (e) {
            console.log(e)
            res.status(403).json({ message: "User not authorized" })
            return next()
        }
    }
}