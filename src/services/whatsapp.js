import { STATUS } from "../model/response.js";
import { getCustomError } from "../utils/vrkcreations.js";
import { triggerErrorInSentry } from "./sentry.js";

const endPoint = `${process.env.WHATSAPP_ENDPOINT || "http://localhost:54321"}`;

export const sendWhatsappOtp = async (number, otp, organization) => {
  return await fetch(`${endPoint}/otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ number, otp, organization }),
  }).then((res) => res.json());
};

export const getUserData = async (number) => {
  const data = await fetch(`${endPoint}/userdata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ number }),
  }).then((res) => res.json());
  if (data.status === STATUS.SUCCESS) {
    return data.data;
  }
  {
    triggerErrorInSentry(getCustomError(`services/whatsapp: ${data.message}`));
    return {};
  }
};
