const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthdate: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

/**
 * Static method to encrypt the user's password when creating or updating the user
 * @method hashPassword
 * @param {*} password
 * @returns {string} - String containing the encrypted password
 */
userSchema.statics.hashPassword = function (password) {
  return bcrypt.hashSync(password, 10);
};

/**
 * Method used to validate the user's password agains the encrypted version
 * in the database when they try to log in.
 * @method validatePassword
 * @param {*} password
 * @returns {boolean} - True or false depending if the submitted password matches
 * the enctrypted version from the database
 */
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
