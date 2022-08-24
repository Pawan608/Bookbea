const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A Book should have a title"],
    min: [2, "A title should atleast be of 2 words"],
  },
  description: {
    type: String,
    min: [10, "Description Should be greater than 10 words"],
    require: [true, "A book must contain description"],
  },
  coverImage: {
    type: String,
    required: [true, "A book must contain a cover image"],
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A should have an author"],
  },
  file: {
    type: String,
    required: [true, "A book must contain pdf file"],
  },
  edition: {
    type: String,
  },
  authorName: {
    type: String,
    required: [true, "A book must have an author"],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});
const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
