const UserLocation = require("../models/UserLocation");
const helper = require("./serviceHelper/userLocationHelper");

const { getValidationError } = require("../utils/getCustomErrors");

const displayAllUserLocations = async (req, res, next) => {
  const userId = req.user._id;
  const existingUserLocations = await helper.getExistingUserLocations(userId);

  res.json(existingUserLocations);
};

const createUserLocation = async (req, res, next) => {
  const userId = req.user._id;
  const geocodedName = req.body.geocodedLocationName;

  const lat = Number(req.body.lat);
  const lng = Number(req.body.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return next(getValidationError(`Invalid lat/lng [${lat}, ${lng}]`));
  }

  const globalLocation = await helper.createGlobalLocationIfNotExisting(lat, lng, geocodedName);
  const isUserLocationCreated = await helper.createUserLocationIfNotExisting(userId, globalLocation, req.body);

  if (isUserLocationCreated) {
    res.status(201).json({ message: "Location created" });
  } else
    res
      .status(400)
      .json({ message: "Location already exists in your locations" });
};

const updateUserLocation = async (req, res, next) => {
  const locationId = req.params.locationId;

  const updateObject = {
    locationName: req.body.locationName
  };
  await UserLocation.findByIdAndUpdate(
    locationId,
    updateObject
  );

  res.status(200).json({ message: "Successful update!" });
};

const deleteUserLocation = async (req, res, next) => {
  const userId = req.user._id;
  const locationId = req.params.locationId;
  
  const deletedLocation = await UserLocation.findOneAndDelete({
    _id: locationId, 
    userId
  });

  if (!deletedLocation) {
    res.status(404).json({ message: "Userlocation not found" });
  } else {
    res.status(200).json({ message: "Successful Delete" });
  }
};

module.exports = {
  displayAllUserLocations,
  createUserLocation,
  updateUserLocation,
  deleteUserLocation
};
