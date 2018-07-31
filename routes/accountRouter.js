const express = require('express')
const accountRouter = express.Router()
accountRouter.use(express.json())


accountRouter.get('/', (req, res, next) => { res.json({ message: "Welcome!" }) })



module.exports = (app) => {
    app.use('/account', accountRouter)
}