const express = require("express");
const logger = require("morgan");
const app = express();
require("dotenv").config();

app.use(logger("dev"));
app.use(express.json());

// Routes
const indexRouter = require('./routes/index')
const accountRouter = require('./routes/accountRouter')
const userLocationRouter = require('./routes/userLocationRouter')

indexRouter(app);
accountRouter(app);
userLocationRouter(app);

// Error Handlers
app.use((req, res, next) => {
  res.status(404).json({ error: "Invalid request!" });
});

module.exports = app;
