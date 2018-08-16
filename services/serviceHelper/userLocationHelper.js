const GlobalLocation = require("../../models/GlobalLocation");
const UserLocation = require("../../models/UserLocation");

const createGlobalLocation = async (lat, lng, geocodedLocationName) => {
  const globalLocation = new GlobalLocation({
    lat,
    lng,
    geocodedLocationName
  });
  return await globalLocation.save();
};

const createGlobalLocationIfNotExisting = async (lat, lng, geocodedLocationName) => {
  const matchingGlobalLocation = await GlobalLocation.findOne({ lat, lng });
  if (matchingGlobalLocation) {
    return matchingGlobalLocation._id;
  }
  return await createGlobalLocation(lat, lng, geocodedLocationName);
};

const getExistingUserLocations = async userId => {
  const userExistingLocations = await UserLocation.find({ userId }).populate(
    "globalLocation"
  );
  return userExistingLocations;
};

const isUserLocationWithGlobalIdExists = async (userId, globalLocationId) => {
  const userExistingLocations = await getExistingUserLocations(userId);

  const index = userExistingLocations.findIndex(
    location => JSON.stringify(location.globalLocation._id) === JSON.stringify(globalLocationId)
  );
  return index !== -1;
};

const createUserLocationIfNotExisting = async (userId, globalLocation, requestBody) => {
  const globalLocationId = globalLocation._id;
  const { isPublic, locationName, userRating, userFeedBack } = requestBody;

  const userLocationExists = await isUserLocationWithGlobalIdExists(userId, globalLocationId);
  if (userLocationExists) {
    return false;
  }

  const userLocation = new UserLocation({
    userId,
    globalLocation: globalLocationId,
    isPublic,
    locationName,
    userRating,
    userFeedBack
  });
  await userLocation.save();
  return true;
};

const isUserFeedBack = (requestBodyUserFeedBack, array) => {
  if (requestBodyUserFeedBack) {
    return [...array, requestBodyUserFeedBack];
  }
  return [...array];
};

module.exports = {
  getExistingUserLocations,
  createGlobalLocationIfNotExisting,
  createUserLocationIfNotExisting,
  isUserFeedBack
};
