import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { default as logger } from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";
import vrkCreationsRouter from "./src/routers/vrkcreations.js";
import cors from "cors";
import "dotenv/config.js";
import hostingRouter from "./src/routers/hosting.js";
import filesRouter from "./src/routers/files.js";
import authRouter from "./src/routers/auth.js";
import session from "express-session";
import Passport from "./src/services/auth.js";
import MongoStore from "connect-mongo";
import { mongoDBClient } from "./src/services/mongoDB.js";
import { collections } from "./src/constants/DB.js";
import { triggerErrorInSentry } from "./src/services/sentry.js";
import dataRouter from "./src/routers/data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: false,
    signed: true,
    store: MongoStore.create({
      client: mongoDBClient,
      collectionName: collections.AUTH_SESSIONS,
    }),
  })
);

app.use("/", express.static(path.join(__dirname, "public")));
app.use(Passport.authenticate("session"));

app.get("/", (req, res) => {
  res.redirect("/site");
});

app.use("/site", express.static(path.join(__dirname, "./static/site")));
app.get("/site/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./static/site", "index.html"));
});

app.use("/wedsite", express.static(path.join(__dirname, "./static/wedsite")));
app.get("/wedsite/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./static/wedsite", "index.html"));
});

// need completion
app.use("/hosting/", hostingRouter);

app.use("/api/auth/", authRouter);

app.use("/api/vrkcreations", vrkCreationsRouter);

app.use("/api/files", filesRouter);

app.use("/api/data", dataRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  err.message =
    err.message +
    " | " +
    req.protocol +
    "://" +
    req.get("host") +
    req.originalUrl+" ip:"+req.ip;
  triggerErrorInSentry(err);
  res.locals.message = err.message;
  console.log(req.query);
  console.log(req.cookies);
  console.log(req.url);

  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  if (res.isResponseSent) {
    return;
  }
  res.send(
    `Error in application, errorCode:${err.status || 500}:${err.message}`
  );
});

export default app;
