import { execSync } from "child_process";
import { collections } from "../../src/constants/DB.js";
import { exit } from "process";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { log } from "console";
import { db } from "../../src/services/mongoDB.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let hostingSet = await db
  .collection(collections.HOSTING_SITES_DATA)
  .find({})
  .toArray();

let hostingCompletedCount = 0;

hostingSet.forEach((data) => {
  if (!existsSync(`${__dirname}/../../static/hosting/${data._id.toString()}`)) {
    mkdirSync(`${__dirname}/../../static/hosting/${data._id.toString()}`);
    if (data?.source?.type === "git") {
      execSync(
        `git clone -b ${data?.source?.branch || "main"} ${
          data?.source?.link
        } .`,
        {
          cwd: `${__dirname}/../../static/hosting/${data._id.toString()}`,
        },
        (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          console.error(`stderr: ${stderr}`);
        }
      );
    }
  }
  hostingCompletedCount++;
  console.log(data._id);
});

while (hostingCompletedCount < hostingSet.length);
exit();
