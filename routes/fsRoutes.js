const {Router} = require('express');
const router = new Router()
const controller = require('../controllers/fsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use('/setUserAvatar', authMiddleware(['ADMIN', 'USER']), controller.setUserAvatar)
router.use('/getUserAvatar/:avatarDir', controller.getUserAvatar)
router.use('/getUserAvatarName/:userName', controller.getUserAvatarName)

module.exports = router