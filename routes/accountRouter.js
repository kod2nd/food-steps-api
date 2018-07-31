const express = require("express");
const accountRouter = express.Router();
const User = require("../models/User");
accountRouter.use(express.json());

accountRouter.get("/", (req, res, next) => {
  res.json({ message: "Welcome!" });
});

accountRouter.post("/signup", async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const newUser = new User({
      username,
      email
    });
    newUser.setHashedPassword(password);
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error occured in POST user", err);
    next(err);
  }
});

module.exports = app => {
  app.use("/account", accountRouter);
};
