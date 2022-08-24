const Message = require("./../Models/messageModel");
const User = require("./../Models/userModel");
const mongoose = require("mongoose");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
exports.updateMessage = async function ({ message, id, receiverId, userName }) {
  //////////////////For Message Sender//////////////////////////////
  console.log("hello receiver ID");
  let messageSender;
  const receiverName = await User.find({
    _id: mongoose.Types.ObjectId(receiverId),
  });
  console.log(receiverName[0].name, userName);
  //console.log({ message, id, receiverId, userName, receiverName });
  messageSender = await Message.find({ _id: id });
  if (!messageSender.length) {
    messageSender = await Message.create({
      _id: id,
      messages: {
        recepient: receiverId,
        message: message,
        path: "Sent",
        date: Date.now(),
        recepientName: receiverName[0].name,
      },
    });
  }
  console.log(receiverId);
  if (messageSender.length) {
    const messageSender = await Message.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          messages: {
            $each: [
              {
                message: message,
                path: "Sent",
                date: Date.now(),
                recepient: receiverId,
                recepientName: receiverName[0].name,
              },
            ],
          },
        },
      },
      { new: true }
    );
  }

  ////////////////////////For Message Receiver/////////////////////////////////
  messageReceiver = await Message.find({ _id: receiverId });
  if (!messageReceiver.length) {
    messageReceiver = await Message.create({
      _id: receiverId,
      messages: {
        recepient: id,
        message: message,
        path: "Received",
        date: Date.now(),
        recepientName: userName,
      },
    });
  }
  if (messageReceiver.length) {
    const messageReceiver = await Message.findOneAndUpdate(
      { _id: receiverId },
      {
        $push: {
          messages: {
            $each: [
              {
                message: message,
                path: "Received",
                date: Date.now(),
                recepient: id,
                recepientName: userName,
              },
            ],
          },
        },
      },
      { new: true }
    );
  }
  return;
};

exports.getAllChats = async (req, res, next) => {
  console.log(req.params);
  const messages = await Message.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $unwind: { path: "$messages", preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: "$messages.recepient",
        messages: {
          $push: {
            message: "$messages.message",
            date: "$messages.date",
            path: "$messages.path",
          },
        },

        Date: { $first: "$messages.date" },
        recepientName: { $first: "$messages.recepientName" },
      },
      //
    },
    {
      $sort: { Date: -1 },
    },
  ]);
  return res.status(200).json({
    status: "success",
    message: "Successfully retrieved your messages",
    data: {
      connectedWith: messages,
    },
  });
};
