const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const corsOptions = {
  origin: [/http:\/\/localhost:.*/, /http[s]*:\/\/.*\.herokuapp.com/],
  credentials: true
};

const app = express();
require("dotenv").config();

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Routes
const indexRouter = require("./routes/indexRouter");
const accountRouter = require("./routes/accountRouter");
const userLocationRouter = require("./routes/userLocationRouter");

indexRouter(app);
accountRouter(app);
userLocationRouter(app);

// Error Handlers
app.use((req, res, next) => {
  res.status(404).json({ error: "Invalid request!" });
});

module.exports = app;
