const express = require("express");
const userLocationsRouter = express.Router();
const { passport } = require("../config/passport");

const userLocationService = require("../services/userLocationService");
const handleAsyncError = require("../utils/handleAsyncError");
const errorHandler = require("../middlewares/error-handler");

userLocationsRouter.use(express.json());

// Get needs to show a list of user locations - still yet to be done
userLocationsRouter.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  handleAsyncError(userLocationService.displayAllUserLocations)
);

userLocationsRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  handleAsyncError(userLocationService.createUserLocation)
);

userLocationsRouter.put(
    "/:locationId", passport.authenticate("jwt", { session: false }),
    handleAsyncError(userLocationService.updateUserLocation)
)

userLocationsRouter.delete(
  "/:locationId", passport.authenticate("jwt", { session: false }),
  handleAsyncError(userLocationService.deleteUserLocation)
)

module.exports = app => {
  app.use("/locations/user", userLocationsRouter, errorHandler);
};
