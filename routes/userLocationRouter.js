const express = require('express')
const userLocationsRouter = express.Router()

const GlobalLocation = require('../models/GlobalLocation');
const UserLocation = require('../models/UserLocation');
const { getLocationsHandler, postLocationsHandler } = require('../middlewares/userLocationRouterHelper')

userLocationsRouter.use(express.json())

// Get needs to show a list of user locations - still yet to be done
userLocationsRouter.get('/:id', getLocationsHandler)

userLocationsRouter.post('/:id', postLocationsHandler )

module.exports = (app) => {
    app.use('/locations/user', userLocationsRouter)
}