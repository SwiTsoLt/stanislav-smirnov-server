const {Router} = require('express');
const router = new Router()
const controller = require('../controllers/userInfoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use('/getUserInfo', authMiddleware(['ADMIN', 'USER']), controller.getUserInfo)
router.use('/getUsers', authMiddleware(['ADMIN']), controller.getUsers)
router.use('/deleteUser', authMiddleware(['ADMIN']), controller.deleteUser)
router.use('/editUser', authMiddleware(['ADMIN']), controller.editUser)

module.exports = router