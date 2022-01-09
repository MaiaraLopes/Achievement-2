const express = require("express"),
  morgan = require("morgan");
const app = express();

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

app.get("/movies", function (req, res) {
  res.json(topMovies);
});

app.use(express.static("public"));

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, function () {
  console.log("My app is running.");
});
