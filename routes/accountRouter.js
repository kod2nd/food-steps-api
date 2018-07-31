const express = require("express");
const errorHandler = require("../middlewares/error-handler");
const User = require("../models/User");
const handleAsyncError = require('../utils/handleAsyncError');

const accountRouter = express.Router();
accountRouter.use(express.json());

accountRouter.get("/", (req, res, next) => {
	res.json({ message: "Welcome!" });
});

accountRouter.post(
	"/signup",
	handleAsyncError(async (req, res, next) => {

		const { username, password, email } = req.body;
		const newUser = new User({
			username,
			email
        });
		newUser.setHashedPassword(password);
		await newUser.save();
		res.status(201).json({ message: "User created successfully" });
	})
);

module.exports = app => {
	app.use("/account", accountRouter, errorHandler);
};
