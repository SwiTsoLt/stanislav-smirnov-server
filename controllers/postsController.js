const Post = require('../models/Post.js')
const User = require('../models/User.js')
const config = require('config');
const Uuid = require('uuid');
const jwt = require("jsonwebtoken")
const URL = require('url');
const fs = require('fs');
const path = require('path');

class PostsController {
    async getPage(req, res) {

        try {
            const searchLimit = config.get("searchLimit")
            const page = req.params.page || 1
            const posts = await Post.find().skip((page - 1) * searchLimit).limit(searchLimit)

            if (posts) return res.status(200).json({ posts })

            return res.status(400).json({ message: "Something went wrong!" })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ message: e.message })
        }

    }

    async createPost(req, res) {
        try {
            const url = URL.parse(req.url, true)
            const postTitle = url.query.postTitle
            const postBody = url.query.postBody

            const file = req.files?.file

            if (file) {
                const postImageName = Uuid.v4() + ".jpg"
                const post = new Post({
                    title: postTitle,
                    imageName: postImageName,
                    body: postBody || none
                })

                await post.save()

                const filePath = path.join(__dirname, "../", "static", "posts_images", postImageName)
                console.log(filePath);

                file.mv(filePath)
                return res.status(201).json({ message: "Post was created successful" })
            }

            const post = new Post({
                title: postTitle,
                imageName: "",
                body: postBody,
            })

            await post.save()
            return res.status(201).json({ message: "Post was created successful" })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: "Something went wrong" }] })
        }
    }

    async deletePost(req, res) {
        try {
            const url = URL.parse(req.url, true)

            await Post.findOneAndDelete({ _id: url.query.postId })

            return res.status(200).json({ message: "Post was deleted successful" })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async editPost(req, res) {
        try {
            const newPost = req.body.newPost

            Post.findByIdAndUpdate(newPost._id, { ...newPost }, (err) => {
                if (err) return res.status(300).json({ errors: [{ message: err }] })

                return res.status(200).json({ message: "Post was update successful" })
            })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async likesUpdate(req, res) {
        try {
            const { postId } = req.body
            const token = req.headers.authorization?.split(' ')[1]
            const { id } = jwt.decode(token, config.get("jwtSecret"), (e) => {
                if (e) {
                    return res.status(400).json({ message: "User not authorized" })
                }
            })

            const user = await User.findOne({ _id: id })
            const post = await Post.findOne({ _id: postId })
            const candidate = post.likes.includes(id)

            if (candidate) {

                const postsArrayCandidate = post.likes.filter(userId => userId !== id)
                const responsePost = await Post.findOneAndUpdate({ _id: postId }, { likes: postsArrayCandidate })
                const likesArrayCandidate = user.likedPosts.filter(el => el !== postId)
                const responseUser = await User.findOneAndUpdate({ _id: id }, { likedPosts: likesArrayCandidate })

                if (!!responsePost && !!responseUser) return res.status(200).json({ enter: false })

                return res.status(400).json({ errors: [{ message: "Something went wrong" }] })
            }

            await Post.findByIdAndUpdate({ _id: postId }, { likes: [...post.likes, id] })
            await User.findOneAndUpdate({ _id: id }, { likedPosts: [...user.likedPosts, postId] })

            return res.status(200).json({ enter: true })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async postComment(req, res) {
        try {
            const { text, postId } = req.body
            const token = req.headers.authorization?.split(' ')[1]
            const { id } = jwt.decode(token, config.get("jwtSecret"), (e) => {
                if (e) {
                    return res.status(400).json({ message: "User not authorized" })
                }
            })

            const user = await User.findOne({ _id: id })
            const post = await Post.findOne({ _id: postId })

            const responsePost = await Post.findByIdAndUpdate(
                postId,
                { comments: [...post.comments, { username: user.username, text: text }] }
            )

            const responseUser = await User.findByIdAndUpdate(
                user._id,
                { commentedPosts: [...user.commentedPosts, postId] }
            )

            if (responsePost && responseUser) return res.status(200).json({ message: "comment successfully published" })

            return res.status(400).json({ message: "Something went wrong" })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async getComments(req, res) {
        try {
            const url = URL.parse(req.url, true)
            const post = await Post.findOne({ _id: url.query.postId })

            return res.status(200).json({ commentsList: post.comments })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async getPostImage(req, res) {
        try {
            const postImageName = req.params.postImageName
            const filePath = path.join(__dirname, "../", "static", "posts_images", postImageName)
            console.log(postImageName);
            console.log(filePath);
            const candidateImage = fs.existsSync(filePath)

            if (!candidateImage) return res.status(404).json({ message: "Post image not found" })

            const postImage = fs.readFileSync(filePath)

            return res.status(200).end(postImage)
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async deleteComment(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const { id } = jwt.decode(token, config.get("jwtSecret"), (e) => {
                if (e) {
                    return res.status(400).json({ message: "User not authorized" })
                }
            })
            const url = URL.parse(req.url, true)
            const user = await User.findById(id)

            if (!user) return res.status(403).json({ errors: [{ message: "User was not found" }] })

            const post = await Post.findById(url.query.postId)

            if (!post) return res.status(403).json({ errors: [{ message: "Post was not found" }] })

            const postId = url.query.postId
            const commentIndex = url.query.commentIndex
            const currentComment = post.comments[url.query.commentIndex]

            if (!currentComment) return res.status(403).json({ errors: [{ message: "Comment was not found" }] })

            if (
                (currentComment.username !== user.username) ||
                !user.roles.includes("ADMIN")
            ) return res.status(403).json({ errors: [{ message: "The comment does not belong to the current user" }] })

            await Post.findByIdAndUpdate(postId, {
                comments: post.comments.filter((_comment, index) => index != commentIndex)
            })
            await User.findByIdAndUpdate(user._id, {
                commentedPosts: user.commentedPosts.filter(commentedPostId => commentedPostId !== postId)
            })

            return res.status(203).json({ message: "Comment was deleted successful" })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async editComment(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1]
            const { id } = jwt.decode(token, config.get("jwtSecret"), (e) => {
                if (e) {
                    return res.status(400).json({ message: "User not authorized" })
                }
            })

            const url = URL.parse(req.url, true)
            const user = await User.findById(id)

            if (!user) return res.status(403).json({ errors: [{ message: "User was not found" }] })

            const post = await Post.findById(url.query.postId)

            if (!post) return res.status(403).json({ errors: [{ message: "Post was not found" }] })

            const postId = url.query.postId
            const commentIndex = url.query.commentIndex
            const commentText = url.query.commentText
            const currentComment = post.comments[url.query.commentIndex]

            if (!currentComment) return res.status(403).json({ errors: [{ message: "Comment was not found" }] })
            if (
                (currentComment.username !== user.username) ||
                !user.roles.includes("ADMIN")
            ) return res.status(403).json({ errors: [{ message: "The comment does not belong to the current user" }] })

            const editedCommentsList = post.comments.map((comment, index) => {
                if (Number(index) === Number(commentIndex)) {
                    comment.text = commentText
                    return comment
                }
            });

            await Post.findByIdAndUpdate(postId, { comments: editedCommentsList })

            return res.status(203).json({ message: "Comment was edit successful" })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }
}

module.exports = new PostsController()