const jwtSecret = "your_jwt_secret";

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport");

let generateJWTToken = function (user) {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

/**
 * Enables user to login to app
 * @param {*} router
 * @returns {object} user, token
 */

module.exports = function (router) {
  router.post("/login", function (req, res) {
    passport.authenticate(
      "local",
      { session: false },
      function (error, user, info) {
        if (error || !user) {
          return res.status(400).json({
            message: "Something is not right",
            user: user,
          });
        }
        req.login(user, { session: false }, function (error) {
          if (error) {
            res.send(error);
          }
          let token = generateJWTToken(user.toJSON());
          return res.json({ user, token });
        });
      }
    )(req, res);
  });
};
