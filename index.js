const express = require("express"),
  morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(morgan("common"));

app.get("/", function (req, res) {
  res.send("Welcome to my movies list!");
});

app.use(express.static("public"));

//GET - Get a list of all movies

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

//GET - Get all data of a single movie by title

app.get("/movies/:Title", function (req, res) {
  Movies.findOne({ Title: req.params.Title })
    .then(function (movie) {
      res.json(movie);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//GET - Get data about a genre by name

app.get("/movies/Genre/:Name", function (req, res) {
  Movies.findOne({ "Genre.Name": req.params.Name })
    .then(function (movie) {
      res.json(movie.Genre);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//GET - Get data about a director by name

app.get("/movies/Director/:Name", function (req, res) {
  Movies.findOne({ "Director.Name": req.params.Name })
    .then(function (movie) {
      res.json(movie.Director);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//POST - Add new user

app.post("/users", function (req, res) {
  Users.findOne({ Username: req.body.Username })
    .then(function (user) {
      if (user) {
        return res.status(400).send(req.body.Username + "already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
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
});

//PUT - Update a specific user's info by Username

app.put("/users/:Username", function (req, res) {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
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
});

//POST - Add a movie to the favorites list

app.post("/users/:Username/movies/:MovieID", function (req, res) {
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
});

//DELETE - Delete a movie from the favorites list

app.delete("/users/:Username/movies/:MovieID", function (req, res) {
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
});

//DELETE - Delete a user by Username

app.delete("/users/:Username", function (req, res) {
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
});

//GET - Get all users

app.get("/users", function (req, res) {
  Users.find()
    .then(function (users) {
      res.status(201).json(users);
    })
    .catch(function (err) {
      res.status(500).send("Error: " + err);
    });
});

//GET - Get a specific user by Username

app.get("/users/:Username", function (req, res) {
  Users.findOne({ Username: req.params.Username })
    .then(function (user) {
      res.json(user);
    })
    .catch(function (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, function () {
  console.log("My app is running.");
});
