import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { default as logger } from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";
import nocache from "nocache";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  ["/site/test", "/site"],
  express.static(path.join(__dirname, "../vrk-creations-site/build"))
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(`Error in application, errorCode:${err.status}`);
});

export default app;
