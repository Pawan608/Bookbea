const mongoose = require("mongoose");
const requestSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.ObjectId,
    ref: "Book",
  },
  book: {
    type: Object,
  },
  authorId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  requestedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  status: {
    type: Boolean,
    default: false,
  },
  expiresIn: {
    type: Date,
    default: Date.now(),
  },
});

requestSchema.index({ bookId: 1, requestedBy: 1 }, { unique: true });
requestSchema.pre("save", function (next) {
  this.populate({
    path: "book",
    select: "-file -date",
  });
  next();
});
requestSchema.pre(/^find/, function (next) {
  this.populate({
    path: "requestedBy",
    select: "name email",
  });
  next();
});
const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
