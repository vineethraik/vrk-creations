import { Router } from "express";
import { fileTypes, handleGetFile, handleSingleFileUpload } from "../controllers/files.js";
import { multerUpload } from "../services/files.js";

const filesRouter = Router();

filesRouter.post(
  "/upload_image",
  multerUpload.single("file"),
  handleSingleFileUpload(fileTypes.image)
);


filesRouter.get("/:id", handleGetFile);



export default filesRouter;
