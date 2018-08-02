const GlobalLocation = require("../models/GlobalLocation");
const UserLocation = require("../models/UserLocation");
const {getExistingUserLocations, isUserLocationExists, getGlobalLocationIdIfExists, createGlobalLocation} = require("./serviceHelper/userLocationHelper")


const displayAllUserLocations = async (req, res, next) => {
  const userId = req.params.id
  const existingUserLocations = await getExistingUserLocations(userId)

  res.json(existingUserLocations);
};

const createUserLocation = async (req, res, next) => {
  const userId = req.user._id;
  const lat = req.body.lat;
  const lng = req.body.lng;
  const geocodedName = req.body.geocodedLocationName;

  let globalLocationId = await getGlobalLocationIdIfExists(lat, lng);

  if (!globalLocationId) {
    globalLocationId = await createGlobalLocation(lat, lng, geocodedName);
  }

  const userLocationExists = await isUserLocationExists(userId, lat, lng)

  if (!userLocationExists) {
    const userLocation = new UserLocation({
      userId,
      globalLocation: globalLocationId,
      isPublic: req.body.isPublic,
      locationName: req.body.locationName
    });

    await userLocation.save();
    res.status(201).json({ message: "Location created" });
  } else res.status(400).json({ message: "Location already exists in your UserLocations" })
};

module.exports = {
  displayAllUserLocations,
  createUserLocation
};
