import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { default as logger } from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";
import vrkCreationsRouter from "./src/routers/vrkcreations.js";
import { initDB } from "./src/services/mongoDB.js";
import cors from "cors";
import "dotenv/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//init db and export it
export const { mongoDBClient, db } = await initDB(
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.DB_LOCATION,
  process.env.DB_NAME
);

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/site");
});
app.use("/site", express.static(path.join(__dirname, "./static/site")));
app.get("/site/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./static/site", "index.html"));
});

app.use("/api/vrkcreations/", vrkCreationsRouter);

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
