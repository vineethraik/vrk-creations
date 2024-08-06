import { triggerErrorInSentry } from "../services/sentry.js";
import { bucket } from "../services/files.js";
import { Readable } from "stream";
import { ObjectId } from "mongodb";
import mime from "mime";
import { db } from "../services/mongoDB.js";
import { collections } from "../constants/DB.js";
import { FileUploadRegistry } from "../model/files.js";
import { FileAccessTypes } from "../constants/files.js";

export const fileTypes = {
  image: "image",
  pdf: "pdf",
  video: "video",
};

// controllers

export const handleSingleFileUpload =
  (fileType) => async (request, response) => {
    try {
      let { file } = request;

      let { originalname, mimetype, buffer } = file;

      if (mimetype.includes(fileType)) {
        const fileId = new ObjectId();
        let uploadStream = bucket.openUploadStream(
          `${fileId.toHexString()}-${originalname}`,
          { id: fileId }
        );
        let readBuffer = new Readable();
        readBuffer.push(buffer);
        readBuffer.push(null);

        const isUploaded = await new Promise((resolve, reject) => {
          readBuffer
            .pipe(uploadStream)
            .on("finish", resolve("successful"))
            .on("error", reject("error occurred while creating stream"));
        });

        let fileRegData = await db
          .collection(collections.FILE_UPLOAD_REGISTRY)
          .insertOne(
            new FileUploadRegistry({
              fileId: uploadStream.id,
              access: { accessType: FileAccessTypes.public },
            })
          );
        response.send({
          status: "succuss",
          fileId: fileRegData.insertedId,
          message: "file uploaded successfully",
        });
      } else {
        response.send({
          status: "failed",
          message: "file uploaded is not image",
        });
      }
    } catch (err) {
      triggerErrorInSentry(`controller/files:${err.message}`);
      response
        .status(500)
        .send({ status: "failed", message: "error uploading file" });
    }
  };

export const handleGetFile = async (request, response) => {
  try {
    let { id } = request.params;
    let { fileId, access } = await db
      .collection(collections.FILE_UPLOAD_REGISTRY)
      .findOne({ _id: new ObjectId(id) });
    if (access.accessType === FileAccessTypes.public) {
      let downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

      downloadStream
        .on("file", (file) => {
          response.set("Content-Type", mime.getType(file.filename));
        })
        .on("error", (error) => {
          triggerErrorInSentry(new Error(`controllers/files:${error.message}`));
          response.status(404).json({ message: "Resource not found" });
        });

      downloadStream.pipe(response);
    } else {
      response.json({
        message: "Access denied",
      });
    }
  } catch (error) {
    triggerErrorInSentry(new Error(`controllers/files:${error.message}`));
    response.status(404).json({ message: "Resource not found" });
  }
};

export const handleMultiFileUpload =
  (fileType) => async (request, response) => {};
