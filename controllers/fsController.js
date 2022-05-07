const config = require('config');
const Uuid = require('uuid');
const fs = require('fs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const path = require('path');

class FsController {
    async setUserAvatar(req, res) {
        try {
            const avatarName = Uuid.v4() + ".jpg"

            const token = req.headers.authorization?.split(' ')[1]
            const { id } = jwt.decode(token, config.get("jwtSecret"), (e) => {
                if (e) {
                    return res.status(400).json({ message: "User not authorized" })
                }
            })
            await User.findByIdAndUpdate(id, { avatarName })
            const file = req.files.file

            const filePath = path.join(__dirname, "../", "static", "users_avatars", avatarName)

            file.mv(filePath)

            return res.status(200).json({ avatarName, message: "Avatar was successfully uploaded" })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ message: "Upload avatar error" })
        }
    }

    async getUserAvatar(req, res) {
        try {
            const avatarDir = req.params.avatarDir
            const filePath = path.join(__dirname, "../", "static", "users_avatars", avatarDir)
            if (fs.existsSync(filePath)) {
                const avatar = fs.readFileSync(filePath)
                return res.status(200).end(avatar)
            }
            return res.status(400).json({ message: "User Avatar not found" })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ message: "Get avatar error" })
        }
    }

    async getUserAvatarName(req, res) {
        try {
            const userName = req.params.userName
            const user = await User.findOne({ username: userName })
            if (user) {
                if (user.avatarName) {
                    return res.status(200).json({ avatarName: user.avatarName })
                }
                return res.status(400).json({ message: "User avatar not found" })
            }
            return res.status(400).json({ message: "User not found" })
        } catch (e) {
            console.log(e);
            return res.status(400).json({ message: "Get avatar name error" })
        }
    }
}

module.exports = new FsController()