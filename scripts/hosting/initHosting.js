import { existsSync, mkdirSync} from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { collections } from '../../src/constants/DB.js';
import { exit } from 'process';
import { db } from '../../src/services/mongoDB.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if(!existsSync(`${__dirname}/../../static/hosting`)){
mkdirSync(`${__dirname}/../../static/hosting`);
}
const hostingSet =  await db.collection(collections.HOSTING_SITES_DATA).find({}).toArray();

exit();