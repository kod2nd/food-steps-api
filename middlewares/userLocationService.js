const GlobalLocation = require("../models/GlobalLocation");
const UserLocation = require("../models/UserLocation");

const sayHello = (req, res, next) => {
  res.json({
    message: "Hello from userLocations Router!"
  });
};

const getGlobalLocationIdIfExist = async (lat, lng) => {
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

const createUserLocation = async (req, res, next) => {
  const lat = req.body.lat;
  const lng = req.body.lng;
  const geocodedName = req.body.geocodedLocationName;
  let globalLocationId = await getGlobalLocationIdIfExist(lat, lng);

  if (!globalLocationId) {
    globalLocationId = await createGlobalLocation(lat, lng, geocodedName);
  }

  const userLocation = new UserLocation({
    userId: req.params.id,
    globalLocation: globalLocationId,
    isPublic: req.body.isPublic,
    locationName: req.body.locationName
  });

  await userLocation.save();

  res.status(201).json({ message: "Location created" });
};

module.exports = {
  sayHello,
  createUserLocation
};
