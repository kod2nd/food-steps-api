const express = require("express");
const indexRouter = express.Router();
indexRouter.use(express.json());
const indexService = require("../services/indexService");

indexRouter.get("/", indexService.welcomeMessage);

module.exports = app => {
  app.use("/", indexRouter);
};
