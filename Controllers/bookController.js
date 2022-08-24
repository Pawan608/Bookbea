const multer = require("multer");
const sharp = require("sharp");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const cloudinary = require("./../utils/cloudinary");
const Book = require("./../Models/BookModel");
const User = require("./../Models/userModel");
const fs = require("fs");
const catchAsync = require("../utils/catchAsync");
/////////////////////Upload Book///////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.includes("pdf")) {
    cb(null, true);
  } else {
    cb(new AppError("Not a PDF! Please upload only PDF.", 400), false);
  }
};
const uploadFile = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadBookPdf = uploadFile.fields([{ name: "file", maxCount: 1 }]);
exports.resizePdf = catchAsync(async (req, res, next) => {
  //   if (!req.files)
  //     return next(new AppError("You must provide at least one image", 400));
  await Promise.all(
    req.files.file.map(async (file, i) => {
      const filename = `cover-${req._id}-${Date.now()}.pdf`;
      fs.writeFile(`public/books/${filename}`, file.buffer, async (err) => {
        if (err) next(err);
        else {
          const result = await cloudinary.uploader.upload(
            `public/books/${filename}`
          );
          req.body.filename = result.secure_url;
          return next();
        }
      });
    })
  );
});

//////////////////////Upload Cover Image/////////////////////////////
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
const multerImageStorage = multer.memoryStorage();
const multerImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const uploadImage = multer({
  storage: multerImageStorage,
  fileFilter: multerImageFilter,
});

exports.uploadcoverImage = uploadImage.fields([
  { name: "coverImage", maxCount: 1 },
]);

exports.resizeImage = catchAsync(async (req, res, next) => {
  //   if (!req.files)
  //     return next(new AppError("You must provide at least one image", 400));
  console.log("File pdf", req.files);
  await Promise.all(
    req.files.coverImage.map(async (file, i) => {
      const filename = `cover-${req._id}-${Date.now()}-${i + 1}.jpeg`;
      const file1 = await sharp(file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/coverImage/${filename}`);
      const result = await cloudinary.uploader.upload(
        `public/coverImage/${filename}`
      );
      req.body.coverImage = result.secure_url;
    })
  );
  next();
});
exports.getURL = catchAsync(async (req, res, next) => {
  if (!req.body.filename) return next(new AppError("Select file", 400));
  res.status(200).json({
    status: "success",
    message: "File successfully added",
    data: {
      url: req.body.filename,
    },
  });
});
exports.uploadBook = catchAsync(async (req, res, next) => {
  const book = await Book.create({
    title: req.body.title,
    description: req.body.description,
    coverImage: req.body.coverImage,
    author: req._id,
    file: req.body.file,
    authorName: req.body.authorName,
    edition: req.body.edition,
  });
  res.status(201).json({
    message: "Book successfully uploaded",
    status: "success",
    data: {
      book,
    },
  });
});

//////////////////Get All Books//////////////////
exports.getAllBooks = catchAsync(async (req, res, next) => {
  const books = await Book.find().select("-file");
  res.status(200).json({
    status: "success",
    message: "All Books",
    data: {
      books,
    },
  });
});

////////////////////Get My Book//////////////////////
exports.getMyBook = catchAsync(async (req, res, next) => {
  const books = await User.find({ _id: req._id })
    .populate({ path: "myBook" })
    .select("myBook");
  res.status(200).json({
    status: "success",
    message: "All your books",
    data: {
      books,
    },
  });
});
