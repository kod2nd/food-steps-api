const express = require('express')
const indexRouter = express.Router()
indexRouter.use(express.json())


indexRouter.get('/', res.json({}) )

module.exports = (app) => {
    app.use('/', indexRouter)
}