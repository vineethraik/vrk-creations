#!/usr/bin/env node

/**
 * Module dependencies.
 */
import debug from "debug";
import app from "../app.js";
import http from "http";
import greenlockExpress from "greenlock-express";
import "dotenv/config";
import * as url from "url";
let debugServer = debug("vrk-creations:server");
const __dirname = url.fileURLToPath(new URL("../", import.meta.url));
/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "4041");
if (!process.env.RUN_GREENLOCK) app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

if (process.env.RUN_GREENLOCK) {
  greenlockExpress
    .init({
      packageRoot: __dirname,
      maintainerEmail: "vineethraik@gmail.com",
      configDir: "./greenlock.d",
      cluster: false,
    })
    .serve(app);
} else {
  server.listen(port);
  server.on("error", onError);
  server.on("listening", onListening);
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debugServer("Listening on " + bind);
}
