const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function authMiddleware(roles) {
    return function (req, res, next) {
        req.method === "OPTIONS" && next()
        try {
            const token = req?.headers?.authorization?.split(' ')[1] || null
            if (token) {
                const { roles: userRoles } = jwt.decode(token, config.get('jwtSecret'), (e) => {
                    if (e) {
                        return res.status(403).json({ message: "User not authorized" })
                    }
                })
                let hasRole = false
                userRoles.forEach(role => {
                    hasRole = !!roles.includes(role)
                })
                if (hasRole) {
                    return next()
                }
                return res.status(403).json({ message: "No access" })
            }
            return res.status(403).json({ message: "User not authorized" })
        } catch (e) {
            console.log(e)
            return res.status(403).json({ message: "User not authorized" })
        }
    }
}