import express from "express";
import { sendSlackMessage } from "../services/slack.js";
const trapRouter = express.Router();

const sendTrapMessage = (req) => {
  const path = req.path;
  console.log(`Crawler trapped at ${path}`);
  const message = JSON.stringify({
    text: `Crawler trapped at ${path}`,
    attachments: [
      {
        color: "#danger",
        fields: [
          {
            title: "IP Address",
            value: req.ip,
            short: true,
          },
          {
            title: "Path",
            value: req.originalUrl,
            short: true,
          },
          {
            title: "Method",
            value: req.method,
            short: true,
          },
          {
            title: "User Agent",
            value: req.headers["user-agent"],
            short: false,
          },
        ],
      },
    ],
  });
  sendSlackMessage(process.env.SLACK_TRAP_API_KEY, message);
};

// A function to generate a large string
const generateLargeString = (baseString, repetitions) => {
  let result = "";
  for (let i = 0; i < repetitions; i++) {
    result += baseString;
  }
  return result;
};

// Route for .env files
trapRouter.get(/(.*\/)?\.env$/, (req, res) => {
  sendTrapMessage(req);
  const largeData = generateLargeString("MALICIOUS_DATA_FOR_CRAWLERS;", 10000);
  res.type("text/plain").send(largeData);
});

// Route for wp-config.php
trapRouter.get(/(.*\/)?wp-config\.php$/, (req, res) => {
  sendTrapMessage(req);
  const largeData = generateLargeString("<?php define('DB_PASSWORD', 'malicious_data'); ?>", 10000);
  res.type("application/x-php").send(largeData);
});

// Route for config.js
trapRouter.get(/(.*\/)?config\.js$/, (req, res) => {
  sendTrapMessage(req);
  const largeData = generateLargeString("var config = { secret: 'malicious_data' };", 10000);
  res.type("application/javascript").send(largeData);
});

// Generic trap for other common paths
const commonPathsRegex = [
  /(.*\/)?\.aws\/credentials$/,
  /(.*\/)?\.git\/config$/,
  /(.*\/)?docker-compose\.yml$/,
  /(.*\/)?config\/database\.yml$/,
  /(.*\/)?wp-admin$/,
  /(.*\/)?phpmyadmin$/,
  /(.*\/)?\.ssh\/id_rsa$/,
];

commonPathsRegex.forEach((pathRegex) => {
  trapRouter.get(pathRegex, (req, res) => {
    sendTrapMessage(req);
    const largeData = generateLargeString("MALICIOUS_DATA;", 10000);
    res.type("text/plain").send(largeData);
  });
});

export default trapRouter;
