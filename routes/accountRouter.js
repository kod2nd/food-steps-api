const express = require("express");
const errorHandler = require("../middlewares/error-handler");
const handleAsyncError = require("../utils/handleAsyncError");
const { signUp, signIn, signOut } = require("../services/accountService");

const accountRouter = express.Router();
accountRouter.use(express.json());

accountRouter.get("/", (req, res, next) => {
	res.json({ message: "Welcome!" });
});

accountRouter.post("/signup", handleAsyncError(signUp));

accountRouter.post("/signin", handleAsyncError(signIn));

accountRouter.post("/signout", handleAsyncError(signOut));

module.exports = app => {
	app.use("/account", accountRouter, errorHandler);
};
