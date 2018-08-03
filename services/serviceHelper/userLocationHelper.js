const GlobalLocation = require("../../models/GlobalLocation");
const UserLocation = require("../../models/UserLocation");

const getExistingUserLocations = async userId => {
  const userExistingLocations = await UserLocation.find({ userId }).populate('globalLocation');
  return userExistingLocations;
};

const isUserLocationExists = async (userId, lat, lng) => {
  const userExistingLocations = await getExistingUserLocations(userId);

  const index = userExistingLocations.findIndex(location =>
    location.globalLocation.lat === lat && location.globalLocation.lng === lng
  );
  return index !== -1;
};

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

const isUserFeedBack = (requestBodyUserFeedBack, array) => {
  if (requestBodyUserFeedBack) {
    return [...array, requestBodyUserFeedBack]
  } return [...array]
}

const updateUserLocation = (locationName, userRating, userFeedback) => {
  return {
    locationName,
    userRating,
    userFeedback
  }
}

module.exports = {
  getExistingUserLocations,
  isUserLocationExists,
  getGlobalLocationIdIfExists,
  createGlobalLocation,
  isUserFeedBack,
  updateUserLocation
};
