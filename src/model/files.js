import { ObjectId } from "mongodb";
import { FileAccessTypes } from "../constants/files.js";

export class FileUploadRegistry {
  constructor(data) {
    this.ownerId = data?.ownerId || new ObjectId("66b26bed49556da78dce7bfb");
    this.fileId = data?.fileId;
    this.access = new Access(data.access);
  }
}

class Access {
  constructor(data) {
    this.accessType = data?.accessType || FileAccessTypes.private;
    this.users = data?.users || [
      { userId: new ObjectId("66b26bed49556da78dce7bfb") },
    ];
  }
}
