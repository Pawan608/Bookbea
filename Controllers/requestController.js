const mongoose = require("mongoose");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Request = require("./../Models/requestModel");
const Book = require("./../Models/BookModel");
const User = require("./../Models/userModel");
//////////Post Request//////////////////////////////
exports.makeRequest = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.bookId).select("-file");
  if (!book) return next(new AppError("No book found with the given Id", 400));
  const request = await Request.create({
    book: book,
    bookId: book._id,
    authorId: book.author,
    requestedBy: req._id,
  });
  const user = await User.findOneAndUpdate(
    { _id: req._id },
    { $push: { borrowRequest: book._id } },
    { new: true }
  );
  console.log(user);
  res.status(200).json({
    status: "success",
    message: "Request Successfully sent",
    data: {
      request,
      user,
    },
  });
});

////////////Give Response to the request////////////////////////
exports.responseRequest = catchAsync(async (req, res, next) => {
  const request = await Request.findById(req.params.requestId);
  console.log(typeof req.params.status);
  if (!request) return next(new AppError("No Such request exists", 400));
  if (req._id != request.authorId)
    return next(new AppError("You do not have permission", 400));
  if (req.params.status == "false") {
    const user = await User.findOneAndUpdate(
      { _id: request.requestedBy },
      { $pull: { borrowRequest: request.bookId } }
    );
    await Request.findByIdAndDelete(req.params.requestId);
  }

  request.status = req.params.status;
  request.expiresIn = Date.now() + 15 * 24 * 3600 * 1000;
  request.save({ new: true });
  res.status(200).json({
    message: "Request successfully changed",
    status: "success",
    data: {
      request,
    },
  });
});

/////////////////Get All OutGoing Request//////////////////////
exports.getAllOutgoingRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById(req._id)
    .select("outgoingRequest")
    .populate({
      path: "outgoingRequest",
      options: { sort: { createdAt: -1 } },
    });
  res.status(200).json({
    status: "success",
    message: "All your request",
    data: {
      user,
    },
  });
});

//////////////////////Incoming Request///////////////////////////////
exports.getAllIncomingRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById(req._id)
    .select("incomingRequest")
    .populate({
      path: "incomingRequest",
      options: { sort: { createdAt: -1 } },
    });
  res.status(200).json({
    status: "success",
    message: "All your request",
    data: {
      user,
    },
  });
});

//////////////////Get Shared Books///////////////
exports.getSharedBooks = catchAsync(async (req, res, next) => {
  const sharedBooks = await Request.aggregate([
    {
      $match: {
        authorId: mongoose.Types.ObjectId(req._id),
        status: true,
        expiresIn: { $gte: new Date(Date.now()) },
      },
    },
    {
      $group: {
        _id: "$bookId",
        book: {
          $first: "$book",
        },
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    message: "All your request",
    data: {
      books: sharedBooks,
    },
  });
});

////////////////////Borrowed///////////////////////////////////
exports.getBorrowedBooks = catchAsync(async (req, res, next) => {
  const borrowed = await Request.find({
    $and: [
      { requestedBy: req._id },
      { status: true },
      { expiresIn: { $gte: new Date(Date.now()) } },
    ],
  }).populate({ path: "bookId", select: "file" });
  res.status(200).json({
    status: "success",
    message: "All your request",
    data: {
      books: borrowed,
    },
  });
});
