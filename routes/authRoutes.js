const {Router} = require('express');
const router = new Router()
const controller = require('../controllers/authController');
const { check } = require("express-validator");
const authMiddleware = require('../middleware/authMiddleware');

router.use('/registration', [
    check('userName', 'Username can not be empty').notEmpty(),
    check('userPassword', 'Password must be greater than 4 and less than 12 characters').isLength({ min: 4, max: 12 })
], controller.registration)
router.use('/login',
[
    check('userName', 'Username can not be empty').notEmpty(),
    check('userPassword', 'Password can not be empty').notEmpty()
], controller.login)
router.use('/users', authMiddleware(['ADMIN']), controller.getUsers)
router.use('/getUserInfo', authMiddleware(['ADMIN', 'USER']), controller.getUserInfo)

module.exports = router