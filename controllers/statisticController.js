const config = require("config")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const url = require("url")
const Post = require("../models/Post")


class StatisticController {
    async getGeneralStatistic(req, res) {
        try {
            const amountUsers = await User.find().count()
            const amountPosts = await Post.find().count()

            return res.status(200).json({ data: { amountUsers, amountPosts } })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ message: e })
        }
    }
}

module.exports = new StatisticController()