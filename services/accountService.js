const User = require("../models/User");
const { jwtOptions } = require("../config/passport");
const jwt = require("jsonwebtoken");
const {
	getValidationError,
	getUnauthorisedError
} = require("../utils/getCustomErrors");

const signUp = async (req, res, next) => {
	const { username, password, email } = req.body;
	const newUserModel = new User({
		username,
		email
	});

	// TODO: Refactor these into smaller methods

	// Validating and Verifying password
	if (!password) return next(getValidationError("Password is missing"));
	const isPasswordValid = newUserModel.validatePassword(password);
	if (!isPasswordValid) return next(getValidationError("Password is invalid"));

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
};

const signIn = async (req, res, next) => {
	const { username, password } = req.body;
	const user = await User.findOne({ username: username });

	if (!user) return next(getUnauthorisedError("No such user found"));

	if (!user.verifyPassword(password))
		return next(getUnauthorisedError("Passwords did not match"));

	const userId = { id: user._id };
	const token = jwt.sign(userId, jwtOptions.secretOrKey);

	res.cookie("jwt", token, {
		httpOnly: true
	});
	res.status(200).json({ message: "ok" });
};

const signOut = async (req, res, next) => {
	res.clearCookie("jwt", {
		httpOnly: true
	});
	res.status(200).json({ message: "ok" });
};

module.exports = {
	signUp,
  signIn,
  signOut
};
