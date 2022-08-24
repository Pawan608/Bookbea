const express = require("express");
const router = express.Router();
const authController = require("./../Controllers/authController");
const messageController = require("./../Controllers/messageController");
router.use(authController.checkJWT);
router.get("/:id", messageController.getAllChats);
module.exports = router;
