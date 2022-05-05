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
 * @description - Enables user to login to app
 * @param {URL} - /login
 * @param {HTTP} - POST
 * @param {Query_Paramenters} - none
 * @param {Request_Body} - JSON object
 * @example
 * // Request data format
 * {
 *  "Username": "User1",
 *  "Password": "Password1"
 * }
 * @param {Response} - JSON object
 * @example
 * // Response data format
 * {
 *  user: {
 *    "_id": "asdasd123123123asd",
 *    "Username": "User1",
 *    "Password": "Password1",
 *  	"Email": "user1@email.com",
 *    "Birthdate": "1990-01-01" ,
 *    "FavoriteMovies": []
 *  },
 *  token: "zxcvbnmmnbvcxz1029384756zxcvbnm"
 * }
 * @param {authentication} - Basic HTTP authentication (Username, Password)
 * @callback requestCallback
 * @returns {obejct} - An object containing a JWT token and the logged in user object
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
