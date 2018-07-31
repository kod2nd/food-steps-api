const express = require('express')
const indexRouter = express.Router()
indexRouter.use(express.json())


indexRouter.get('/', (req, res, next) => { res.json({ message: "Welcome!" }) })

module.exports = (app) => {
    app.use('/', indexRouter)
}