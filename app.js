const express = require('express');
const app = express()
const config = require('config');
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');
const postsRoutes = require('./routes/postsRoutes');
const fsRoutes = require('./routes/fsRoutes');
const userInfoRoutes = require('./routes/userInfoRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const fileUpload = require('express-fileupload');

require('dotenv').config()

const PORT = process.env.PORT ||  config.get('port')

if (process.env.NPM_CONFIG_PRODUCTION){
    app.use(express.static('./client/build'))
}

app.use(express.static('./static'))

app.use(express.json())
app.use(fileUpload())

app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/fs', fsRoutes)
app.use('/api/users', userInfoRoutes)
app.use('/api/statistic', statisticRoutes)

const start = async () => {
    try {
        await mongoose.connect(config.get('mongoUri'))
        app.listen(PORT, () => console.log(`Server has been started on http://localhost:${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()