import { MongoClient } from "mongodb";
import 'dotenv/config.js'

export async function initDB(
  userName = "",
  password = "",
  dbLocation = "",
  dbName = ""
) {
  let mongoDBClient;
  let db;
  if (
    userName === "" ||
    password === "" ||
    dbLocation === "" ||
    dbName === ""
  ) {
    throw Error("service/initDB: Incomplete Credentials");
  } else {
    const url = `mongodb://${userName}:${encodeURIComponent(
      password
    )}@${dbLocation}/${dbName}`;
    try {
      mongoDBClient = await new MongoClient(url).connect();
      db = mongoDBClient.db(dbName);
    } catch (error) {
      throw Error(`service/initDB: Db Error(${error.message})`);
    }
    
    return { mongoDBClient, db };
  }
}

export const { mongoDBClient, db } = await initDB(
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.DB_LOCATION,
  process.env.DB_NAME
);
