import express, { Router } from "express";
import { collections } from "../constants/DB.js";
import { db } from "../services/mongoDB.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const hostingRouter = Router();

let hostingSet = await db
  .collection(collections.HOSTING_SITES_DATA)
  .find({})
  .toArray();

hostingSet.map((hostingData) => {
  hostingRouter.use(
    `/${hostingData?._id}`,
    express.static(path.join(__dirname, `../../static/hosting/${hostingData?._id}`))
  );
  if (hostingData?.project.type === "react") {
    hostingRouter.get(`/${hostingData?._id}/*`, (req, res) => {
      res.sendFile(
        path.join(
          __dirname,
          `../../static/hosting${hostingData?._id}`,
          `${hostingData?.project?.entry}`
        )
      );
    });
  } else if (hostingData?.project.type === "html") {
    hostingRouter.get(`/${hostingData?._id}/`, (req, res) => {
      res.sendFile(
        path.join(
          __dirname,
          `../../static/hosting/${hostingData?._id}`,
          `${hostingData?.project?.entry}`
        )
      );
    });
  }
});


export default hostingRouter;
