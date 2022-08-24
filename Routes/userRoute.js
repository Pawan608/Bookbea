const express = require("express");
const userController = require("./../Controllers/userController");
const authController = require("./../Controllers/authController");
const router = express.Router();
router.post(
  "/signup",
  authController.DoesUserExist,
  userController.signupcreate
);
router.post("/login", authController.protect, userController.login);
router.patch(
  "/passwordUpdate",
  authController.checkJWT,
  userController.passwordUpdate
);

module.exports = router;
