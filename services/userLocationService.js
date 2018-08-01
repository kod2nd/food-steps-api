const GlobalLocation = require("../models/GlobalLocation");
const UserLocation = require("../models/UserLocation");

// Helper functions
const getExistingUserLocations = async (userId) => {
  const userExistingLocations = await UserLocation.find({ userId }).populate('globalLocation');
  return userExistingLocations
}

const isUserLocationExists = async (userId, lat, lng) => {
  const userExistingLocations = await getExistingUserLocations(userId)

  const index = userExistingLocations.findIndex(location => {
    return Number(location.globalLocation.lat) === lat && Number(location.globalLocation.lng) === lng
  })
  return index !== -1
}

const getGlobalLocationIdIfExists = async (lat, lng) => {
  const location = await GlobalLocation.findOne({ lat, lng });
  return location ? location._id : undefined;
};

const createGlobalLocation = async (lat, lng, geocodedLocationName) => {
  const globalLocation = new GlobalLocation({
    lat,
    lng,
    geocodedLocationName
  });
  const savedGlobalLocation = await globalLocation.save();
  return savedGlobalLocation._id;
};

// Services
const displayAllUserLocations = async (req, res, next) => {
  const userId = req.params.id
  const existingUserLocations = await getExistingUserLocations(userId)

  res.json(existingUserLocations);
};


const createUserLocation = async (req, res, next) => {
  const userId = req.params.id
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
      userId: req.params.id,
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
