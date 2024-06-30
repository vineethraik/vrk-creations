import { updateSMSCount } from "../controllers/vrkcreations.js";
import { getCustomError, isCustomError } from "../utils/vrkcreations.js";
import { triggerErrorInSentry } from "./sentry.js";

export const sendSMSToUser = async (contact, message, ifttt_key) => {
  try {
    if (`${contact}`.match(/^((\+\d{1,2}\s?)?\d{10})/g)) {
      if (!!ifttt_key) {
        const url = `https://maker.ifttt.com/trigger/send_contact_info/with/key/${ifttt_key}`;
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value1: contact,
            value2: message,
          }),
        })
          .then((res) => res.text())
          .then((res) => {
            console.log(res);
            updateSMSCount().catch((err) => {
              triggerErrorInSentry(
                isCustomError(err)
                  ? err
                  : getCustomError(
                      `controllers/sendSMSToUser: ${err.message}`,
                      err
                    )
              );
            });
          });
      } else {
        throw getCustomError("service/sendSMSToUser: key doesn't exist");
      }
    } else {
      throw getCustomError("service/sendSMSToUser: invalid contact number");
    }
  } catch (error) {
    triggerErrorInSentry(getCustomError("services/sendSMSToUser"))
  }
};
