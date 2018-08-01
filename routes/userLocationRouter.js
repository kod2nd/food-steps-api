const express = require('express')
const userLocationsRouter = express.Router()

const userLocationService = require('../middlewares/userLocationService')

userLocationsRouter.use(express.json())

// Get needs to show a list of user locations - still yet to be done
userLocationsRouter.get('/:id', userLocationService.getLocationsHandler)

userLocationsRouter.post('/:id', userLocationService.postLocationsHandler )

module.exports = (app) => {
    app.use('/locations/user', userLocationsRouter)
}