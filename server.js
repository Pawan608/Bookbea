const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const mongoose = require("mongoose");
const messageController = require("./Controllers/messageController");
const User = require("./Models/userModel");
// process.on("uncaughtException", (err) => {
//   console.log(`Error:  ${err.message}`);
//   console.log(`Shutting down the server  due to  uncaught Exception `);
//   process.exit(1);
// });

const http = require("http");
const port = process.env.PORT || 4000;
var server = http.createServer(app);
const io = require("socket.io")(server);
server.listen(4000);
//const messageController = require("./Controllers/messageController")(io);
io.on("connection", (socket) => {
  console.log("WS connection successfull", socket.id);
  socket.on("joinRoom", async ({ id, room, receiverId }) => {
    // console.log(id, room);
    console.log("user receiver", id, receiverId);
    socket.join(room);
    const receiverName = await User.find({
      _id: receiverId,
    });
    // console.log("sunnn lo na", receiverName[0].name);
    io.to(room).emit("joinRoom", {
      receiverName: receiverName[0].name,
      receiverId,
    });
  });
  socket.on("message", async ({ message, id, receiverId, room, userName }) => {
    // console.log(message);
    console.log(userName);
    io.to(room).emit("message", { message, id });
    await messageController.updateMessage({
      message,
      id,
      receiverId,
      userName,
    });
  });
});
// const server = app.listen(port, () => {
//   console.log(`Server is Working on  http://localhost:${port}`);
// });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

console.log(DB);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"));

process.on("unhandledRejection", (err) => {
  console.log(`Error:  ${err.message}`);
  console.log(`Shutting down the server  due to unhandled  promise rejection `);
  server.close(() => {
    process.exit(1);
  });
});
