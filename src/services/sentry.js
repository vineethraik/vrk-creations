import "dotenv/config.js";
import { sendSlackMessage } from "./slack.js";

export const triggerErrorInSentry = async (error) => {
  if (process.env.SENTRY_KEY) {
    try {
      const text = JSON.stringify({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${"```"}${String(error.message)}${"```"}`,
            },
          },
        ],
      });

      sendSlackMessage(process.env.SENTRY_KEY, text);
    } catch (error) {
      console.log(error.message);
    }
  }
};
