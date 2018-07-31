const express = require('express')
const indexRouter = express.Router()
indexRouter.use(express.json())
const { welcomeMessage } = require('../middlewares/indexRouterHelper')


indexRouter.get('/', welcomeMessage)

module.exports = (app) => {
    app.use('/', indexRouter)
}