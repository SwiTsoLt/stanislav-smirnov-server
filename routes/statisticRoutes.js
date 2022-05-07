const {Router} = require('express');
const router = new Router()
const controller = require('../controllers/statisticController');
const authMiddleware = require('../middleware/authMiddleware');

router.use('/getGeneralStatistic', authMiddleware(['ADMIN', 'USER']), controller.getGeneralStatistic)

module.exports = router