const express = require("express");
const router = express.Router();
const bookController = require("./../Controllers/bookController");
const authController = require("./../Controllers/authController");
const requestRoute = require("./requestRoute");
router.get("/", bookController.getAllBooks);
router.use(authController.checkJWT);
router.post(
  "/",
  bookController.uploadcoverImage,
  bookController.resizeImage,
  bookController.uploadBook
);
router.post(
  "/file",
  bookController.uploadBookPdf,
  bookController.resizePdf,
  bookController.getURL
);
router.get("/getmybook", bookController.getMyBook);
module.exports = router;
