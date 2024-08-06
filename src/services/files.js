import multer from "multer";
import { db } from "./mongoDB.js";
import { GridFSBucket } from "mongodb";

let bucket = new GridFSBucket(db,{bucketName:"uploads"});

  const storage = multer.memoryStorage();
  const multerUpload = multer({ storage });



  export { multerUpload,bucket };
