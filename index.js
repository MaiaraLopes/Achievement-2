const express = require("express"),
  morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

const { check, validationResult } = require("express-validator");

const mongoose = require("mongoose");
const Models = require("./models.js");
const { rest } = require("lodash");

const Movies = Models.Movie;
const Users = Models.User;

/*mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});*/
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(morgan("common"));

/**
 * Welcome page
 * @method GET
 * @param {string} - URL
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {string} - Welcome message
 */
app.get("/", function (req, res) {
  res.send("Welcome to my movies list!");
});

app.use(express.static("public"));

/**
 * Get a list of all movies
 * @method GET
 * @param {string} - URL/movies
 * @param {authentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {object} - An array with a list with all the movies in the database
 */

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Movies.find()
      .then(function (movie) {
        res.status(201).json(movie);
      })
      .catch(function (err) {
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get all the information of the specified movie
 * @method GET
 * @param {string} - URL/movies/:Title
 * @param {authentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {object} - An object with all the information for the movie specified
 */
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Movies.findOne({ Title: req.params.Title })
      .then(function (movie) {
        res.json(movie);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get the information about a specific genre
 * @method GET
 * @param {string} - URL/movies/Genre/:Name
 * @param {authentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {object} - An object with the information about the specified genre
 */

app.get(
  "/movies/Genre/:Name",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Movies.findOne({ "Genre.Name": req.params.Name })
      .then(function (movie) {
        res.json(movie.Genre);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get the information about a specific director
 * @method GET
 * @param {string} - URL/movies/Director/:Name
 * @param {authentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {object} - An object with the information about the specified director
 */

app.get(
  "/movies/Director/:Name",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Movies.findOne({ "Director.Name": req.params.Name })
      .then(function (movie) {
        res.json(movie.Director);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Add a new user
 * @method POST
 * @param {string} - URL/users
 * @param {array} - Checks requirements to register a user
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {object} - An object with the information of the new user
 */

app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non-alphanumeric characters - not allowed"
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  function (req, res) {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return rest.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then(function (user) {
        if (user) {
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthdate: req.body.Birthdate,
          })
            .then(function (user) {
              res.status(201).json(user);
            })
            .catch(function (error) {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * Update the logged in user's information
 * @method PUT
 * @param {string} - URL/users/:Username
 * @param {authentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {object} - An object with the user's updated information
 */

app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthdate: req.body.Birthdate,
        },
      },
      { new: true },
      function (err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Add a movie to the favorites list
 * @method POST
 * @param {string} - ULR/users/:Username/movies/:MovieID
 * @param {authentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {object} - An object with the user's information adding the new favorited movie
 */

app.post(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $push: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      function (err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Delete a movie from the favorites list
 * @method DELETE
 * @param {string} - URL/users/:Username/movies/:MovieID
 * @param {authentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {object} - An object with the user's information without the movie just deleted
 */

app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $pull: { FavoriteMovies: req.params.MovieID },
      },
      { new: true },
      function (err, updatedUser) {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Delete a user
 * @method DELETE
 * @param {string} - URL/users/:Username
 * @param {authentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {string} - An alert pops us informing that the user has been deleted
 */

app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then(function (user) {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found.");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get a list of all users
 * @method GET
 * @param {string} - URL/users
 * @param {atuhentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {array} - A list with all registered users
 */

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Users.find()
      .then(function (users) {
        res.status(201).json(users);
      })
      .catch(function (err) {
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * Get a specific user by Username
 * @method GET
 * @param {string} - URL/users/:Username
 * @param {authentication}
 * @param {requestCallback}
 * @callback requestCallback
 * @returns {object} - An object with the user's information
 */

app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Users.findOne({ Username: req.params.Username })
      .then(function (user) {
        res.json(user);
      })
      .catch(function (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//Function to catch errors
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//Create and listen to the port on the hosted server
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", function () {
  console.log("Listening on Port " + port);
});
