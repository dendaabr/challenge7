const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require('../models/user');

passport.use(
  new passportJWT.Strategy(
    {
      secretOrKey: "DENDA",
      jwtFromRequest: passportJWT.ExtractJwt.fromHeader("authorization"),
    },
    ({ user_id, username }, done) => {
        User.findOne({ username }, (err, result) => {
            if (result) {
                done(null, result);
            } else {
                done({ message: "invalid jwt token or user not found" }, false);
            }
          });
    }
  )
);

module.exports = passport;
