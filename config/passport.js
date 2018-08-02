require('dotenv').config();

const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const User = require("../models/User");

const cookieExtractor = function(req) {
  let token = null;
  if (req && req.cookies) token = req.cookies["jwt"];
  return token;
};

const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  const user = await User.findOne({ _id: jwt_payload.id });
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});

passport.use(jwtStrategy);

module.exports = {
  passport,
  jwtOptions
};
