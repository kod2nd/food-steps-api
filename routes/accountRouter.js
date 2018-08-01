const express = require("express");
const errorHandler = require("../middlewares/error-handler");
const User = require("../models/User");
const { jwtOptions } = require("../config/passport");
const handleAsyncError = require("../utils/handleAsyncError");
const { getValidationError } = require("../utils/getCustomErrors");
const jwt = require("jsonwebtoken");

const accountRouter = express.Router();
accountRouter.use(express.json());

accountRouter.get("/", (req, res, next) => {
  res.json({ message: "Welcome!" });
});

accountRouter.post(
  "/signup",
  handleAsyncError(async (req, res, next) => {
    const { username, password, email } = req.body;
    const newUserModel = new User({
      username,
      email
    });

    // Validating and Verifying password
    if (!password) return next(getValidationError("Password is missing"));
    const isPasswordValid = newUserModel.validatePassword(password);
    if (!isPasswordValid)
      return next(getValidationError("Password is invalid"));

    // Saving
    newUserModel.setHashedPassword(password);
    const newUser = await newUserModel.save();

    // Generating JWT
    const userId = { id: newUser._id };
    const token = jwt.sign(userId, jwtOptions.secretOrKey);

    res.cookie("jwt", token, {
      httpOnly: true
    });
    res.status(201).json({ message: "User created successfully" });
  })
);

accountRouter.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(401).json({ message: "no such user found" }); // TODO
  }
  if (user.verifyPassword(password)) {
    const userId = { id: user._id };
    const token = jwt.sign(userId, jwtOptions.secretOrKey);

    res.cookie("jwt", token, {
      httpOnly: true
    });
    res.status(200).json({ message: "ok" });
  } else {
    res.status(401).json({ message: "passwords did not match" });
  }
});

module.exports = app => {
  app.use("/account", accountRouter, errorHandler);
};
