const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  _id: {
    type: mongoose.Schema.ObjectId,
  },
  userName: String,
  messages: [
    {
      recepient: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      message: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now(),
      },
      path: String,
      recepientName: String,
    },
  ],
});
const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
