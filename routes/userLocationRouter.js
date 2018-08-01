const express = require("express");
const userLocationsRouter = express.Router();

const userLocationService = require("../services/userLocationService");
const handleAsyncError = require("../utils/handleAsyncError");

userLocationsRouter.use(express.json());

// Get needs to show a list of user locations - still yet to be done
userLocationsRouter.get("/:id", handleAsyncError(userLocationService.displayAllUserLocations));

userLocationsRouter.post(
  "/:id",
  handleAsyncError(userLocationService.createUserLocation)
);

module.exports = app => {
  app.use("/locations/user", userLocationsRouter);
};
