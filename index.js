const express = require("express"),
  morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require("mongoose");
const Models = require("./models.js");

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let topMovies = [
  {
    title: "Coco",
    studio: "Disney",
  },
  {
    title: "Luca",
    studio: "Disney",
  },
  {
    title: "Soul",
    studio: "Disney",
  },
  {
    title: "Toy Story",
    studio: "Disney",
  },
  {
    title: "Monsters Inc",
    studio: "Disney",
  },
  {
    title: "The Incredibles",
    studio: "Disney",
  },
  {
    title: "WALL-E",
    studio: "Disney",
  },
  {
    title: "Cars",
    studio: "Disney",
  },
  {
    title: "Finding Nemo",
    studio: "Disney",
  },
  {
    title: "Ratatouille",
    studio: "Disney",
  },
];

app.use(morgan("common"));

app.get("/", function (req, res) {
  res.send("Welcome to my movies list!");
});

/*app.get("/movies", function (req, res) {
  res.json(topMovies);
});*/

app.use(express.static("public"));

//GET - Get information

app.get("/movies", function (req, res) {
  res.send("Successful GET request returning data on all movies on the list.");
});

app.get("/movies/:title", function (req, res) {
  res.send("Successful GET request returning data on the specified movie.");
});

app.get("genres/:title", function (req, res) {
  res.send("Successful GET request returning data on the movie genre.");
});

app.get("/directors/:director", function (req, res) {
  res.send("Successful GET request returning data on the specified director.");
});

/*
POST - Add new user
We'll expect a JSON in this format:
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}
*/
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

//GET all users

app.get("/users", function (req, res) {
  Users.find()
    .then(function (users) {
      res.status(201).json(users);
    })
    .catch(function (err) {
      res.status(500).send("Error: " + err);
    });
});

//PUT - Update user's profile

app.put("/users/:username", function (req, res) {
  res.status(201).send("Successful PUT request updating a user profile.");
});

//DELETE - Delete existing user

app.delete("/users/:username", function (req, res) {
  res.status(201).send("Successful DELETE request deleting an existing user.");
});

//GET - Get favorites list

app.get("/users/:username/movies", function (req, res) {
  res.send(
    "Successful GET request returning data of all movies on the user's list."
  );
});

//POST - Add a movie to the favorites list

app.post("/users/:username/movies/:title", function (req, res) {
  res
    .status(201)
    .send("Successful POST request adding a movie to the user's list.");
});

//DELETE - Delete a movie from the favorites list

app.delete("/users/:username/movies/:title", function (req, res) {
  res
    .status(201)
    .send("Successful DELETE request deleting movie from the user's list.");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, function () {
  console.log("My app is running.");
});
