const config = require("config")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const url = require("url")


class UserInfoController {
    async getUserInfo(req, res) {
        try {
            const token = req?.headers?.authorization?.split(' ')[1]
            const { id } = jwt.decode(token, config.get("jwtSecret"), (e) => {
                if (e) {
                    return res.status(400).json({ message: "User not authorized" })
                }
            })

            const user = await User.findById(id)
            if (user) {
                const userInfo = {
                    userId: user._id,
                    userName: user.username,
                    userRoles: user.roles,
                    avatarName: user.avatarName
                }
                return res.status(200).json({ userInfo })
            }
            
            return res.status(400).json({ errors: [{ message: "User not found" }] })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async getUsers(req, res) {
        try {
            const searchLimit = config.get('searchLimit')
            const usersUrl = url.parse(req.url, true)
            const page = usersUrl.query.page || 1
            const users = await User.find().skip((page - 1) * searchLimit).limit(searchLimit)
            if (users) {
                return res.status(200).json({ users })
            }
            return res.status(400).json({ errors: [{ message: "Something went wrong" }] })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async deleteUser(req, res) {
        try {
            const usersUrl = url.parse(req.url, true)
            const userId = usersUrl.query.userId

            User.findByIdAndDelete(userId, err => {
                if (err) {
                    return res.status(400).json({ errors: [{ message: err.message }] })
                }

                return res.status(200).json({ message: "User was deleted successful" })
            })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }

    async editUser(req, res) {
        try {
            const newUser = req.body.newUser
            console.log(newUser);
            User.findByIdAndUpdate(newUser._id, { ...newUser }, err => {
                if (err) {
                    return res.status(400).json({ errors: [{ message: err.message }] })
                }

                return res.status(200).json({ message: "User was edited successful" })
            })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ errors: [{ message: e.message }] })
        }
    }
}

module.exports = new UserInfoController()