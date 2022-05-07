const {Router} = require('express');
const router = new Router()
const controller = require('../controllers/postsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use('/getPage/:page', controller.getPage)
router.use('/createPost', authMiddleware(['ADMIN']), controller.createPost)
router.use('/deletePost', authMiddleware(['ADMIN']), controller.deletePost)
router.use('/editPost', authMiddleware(['ADMIN']), controller.editPost)
router.use('/likesUpdate', authMiddleware(['ADMIN', 'USER']), controller.likesUpdate)
router.use('/postComment', authMiddleware(['ADMIN', 'USER']), controller.postComment)
router.use('/getComments', authMiddleware(['ADMIN', 'USER']), controller.getComments)
router.use('/getPostImage/:postImageName', controller.getPostImage)
router.use('/deleteComment', authMiddleware(['ADMIN', 'USER']), controller.deleteComment)
router.use('/editComment', authMiddleware(['ADMIN', 'USER']), controller.editComment)

module.exports = router