const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const userRouter = require("./Routes/userRoute");
const globalErrorHandler = require("./Controllers/errorController");
const AppError = require("./utils/appError");
const bookRoute = require("./Routes/bookRoute");
const requestRoute = require("./Routes/requestRoute");
const messageRoute = require("./Routes/messageRoute");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

//app.engine("html", require("hbs").renderFile);
app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data: https: ;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
  );
  next();
}); //
app.use(cookieParser());
// route imports
app.use("/api/v1/users", userRouter);
app.use("/api/v1/book", bookRoute);
app.use("/api/v1/request", requestRoute);
app.use("/api/v1/messages", messageRoute);
////To handle unhandled route
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

////Global middleware to handle all sorts of errors
app.use(globalErrorHandler);
module.exports = app;
