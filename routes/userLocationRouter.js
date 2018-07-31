const express = require('express')
const userLocationsRouter = express.Router()
userLocationsRouter.use(express.json())


userLocationsRouter.get('/', (req, res, next) => { res.json({ message: "Hello from userLocations Router!" }) })

module.exports = (app) => {
    app.use('/user/:id/locations', userLocationsRouter)
}