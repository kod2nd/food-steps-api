const express = require('express')
const userLocationsRouter = express.Router()

const GlobalLocation = require('../models/GlobalLocation');
const UserLocation = require('../models/UserLocation');

userLocationsRouter.use(express.json())

userLocationsRouter.get('/:id', (req, res, next) => { res.json({ message: "Hello from userLocations Router!" }) })

userLocationsRouter.post('/:id', async (req, res, next) => {
    const globalLocation = new GlobalLocation({
        lat: req.body.lat,
        lng: req.body.lng,
        geocodedLocationName: req.body.geocodedLocationName,
    });
    const savedGlobalLocation = await globalLocation.save()

    const userLocation = new UserLocation({
        userId: req.params.id,
        globalLocation: savedGlobalLocation._id,
        isPublic: req.body.isPublic,
        locationName: req.body.locationName,
    })

    await userLocation.save()

    res.json({ message: "Location created" })
})

module.exports = (app) => {
    app.use('/locations/user', userLocationsRouter)
}