import moment from "moment";
import { db } from "../services/mongoDB.js";
import { collections } from "../constants/DB.js";
import { requestTargets } from "../constants/contactUs.js";
import { triggerErrorInSentry } from "../services/sentry.js";
import {
  getCustomError,
  getSMSMessageFromContactUsData,
  getSlackMessageFromContactUsData,
  isCustomError,
} from "../utils/vrkcreations.js";
import { ObjectId } from "mongodb";
import { sendSMSToUser } from "../services/ifttt.js";
import { sendSlackMessage } from "../services/slack.js";

// helper methods

const addContactUsLog = (log) => {
  db.collection(collections.CONTACT_US_LOG)
    .insertOne(log)
    .then((id) => {
      console.log(`log set with id:${id.insertedId}`);
    })
    .catch((err) => {
      console.log(`controller/handleContactUs: ${err.message}`);
      triggerErrorInSentry(
        isCustomError(err)
          ? err
          : getCustomError(`controllers/addContactUsLog: ${err.message}`, err)
      );
    });
};

export const updateSMSCount = async () => {
  return await db
    .collection(collections.CONTACT_US_SETTINGS)
    .findOneAndUpdate({}, { $inc: { sms_sent_today: 1 } });
};

const sendContactUsToPerson = async (id, contactInfo) => {
  try {
    const user = await db
      .collection(collections.CONTACT_US_USERS)
      .findOne({ _id: new ObjectId(`${id}`) });
    const settings = await db
      .collection(collections.CONTACT_US_SETTINGS)
      .findOne({});
    console.log("getting user:", user);
    if (settings.sms_limit_per_day > settings.sms_sent_today) {
      sendSMSToUser(
        user.contact,
        getSMSMessageFromContactUsData(contactInfo),
        settings.ifttt_sms_webhook_key
      );
    }
    sendSlackMessage(
      user.slack_webhook_key,
      getSlackMessageFromContactUsData({
        ...contactInfo,
        recipientName: user.name,
      })
    );
  } catch (error) {
    console.log(error);
    triggerErrorInSentry(
      isCustomError(error)
        ? error
        : getCustomError(
            `controllers/sendContactUsToPerson: ${error.message}`,
            error
          )
    );
  }
};

// controllers
export const handleSendContactUsUsers = async (request, response) => {
  const data = await db
    .collection(collections.CONTACT_US_USERS)
    .find({})
    .toArray();
  const responseData = data.map((user) => {
    return { id: user._id, name: user.name, designation: user.designation };
  });
  response.json(responseData);
};

export const handleContactUs = async (request, response) => {
  const log = {
    timeStamp: `${moment().format("DD-MM-YYYY:HH:mm:ss.SSS")}`,
    ip: request.ip || "unknown",
    contact_us_data: request.body,
  };
  console.log(log,request.body);
  const { target, id, designation } = request.body?.send_to || {};
  try {
    switch (target) {
      case requestTargets.ALL:
      case requestTargets.DESIGNATION:
      case requestTargets.GENERAL:
        sendSlackMessage(
          process.env.CONTACT_US_KEY,
          getSlackMessageFromContactUsData({
            ...request.body,
          })
        );
        break;
      case requestTargets.PERSON:
        sendContactUsToPerson(id, request.body);
        break;

      default:
        break;
    }
    response.send("ok");
  } catch (err) {
    log.message = `${err.message}`;
    response.sendStatus(500);

    triggerErrorInSentry(
      isCustomError(err)
        ? err
        : getCustomError(`controllers//handleContactUs: ${err.message}`, err)
    );
  }
  addContactUsLog(log);
};
