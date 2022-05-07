const Role = require('../models/Role');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const config = require('config');

const generateAccessToken = (id, roles) => {
    const payload = { id, roles }
    return jwt.sign(payload, config.get('jwtSecret'), { expiresIn: "24h" })
}

class AuthController {
    async registration(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Incorrect registration data'
                })
            }
            const { userName, userPassword } = req.body
            const candidate = await User.findOne({ username: userName })
            if (candidate) {
                return res.status(400).json({ message: "User with this name already exists" })
            }
            const hashPassword = await bcrypt.hashSync(userPassword, 12)
            const userRole = await Role.findOne({ value: "USER" })
            const user = new User({ username: userName, password: hashPassword, roles: [userRole.value] })
            await user.save()
            return res.status(201).json({ message: "User was created" })
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Something went wrong" })
        }
    }

    async login(req, res) {
        try {
            const { userName, userPassword } = req.body
            const user = await User.findOne({ username: userName })
            if (!user) {
                return res.status(400).json({ message: `User \"${userName}\" not found` })
            }
            const validPassword = bcrypt.compareSync(userPassword, user.password)
            if (!validPassword) {
                return res.status(400).json({ message: "Incorrect password" })
            }
            const token = generateAccessToken(user._id, user.roles)
            return res.status(200).json({ token })
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Login error" })

        }
    }

    async getUsers(req, res) {
        // const user = new Role()
        // const adminUser = new Role("ADMIN")
        // await user.save()
        // await adminUser.save()

        try {
            const users = await User.find()
            return res.status(200).json(users)
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Something went wrong" })
        }
    }

    async getUserInfo(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1] || null
            const { id } = jwt.verify(token, config.get('jwtSecret'))
            const { username } = await User.findOne({ _id: id })
            return res.status(200).json({userName: username, userId: id})
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Something went wrong" })
        }
    }
}

module.exports = new AuthController()