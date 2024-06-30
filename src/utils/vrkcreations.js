import { socialMediaTypes } from "../constants/contactUs.js";

export const getCustomError = (message, err = new Error()) => {
  err.message = message;
  err.isCustomError = true;
  return err;
};

export const isCustomError = (error) => {
  return error.isCustomError === true;
};

export const getHandleLink = (source, handle) => {
  if (!handle) return undefined;
  switch (source) {
    case socialMediaTypes.WHATSAPP:
      return `https://api.whatsapp.com/send/?phone=${handle}&text&type=phone_number`;
    case socialMediaTypes.INSTAGRAM:
      return `https://www.instagram.com/${handle}/`;
    case socialMediaTypes.TWITTER:
      return `https://twitter.com/${handle}`;
    case socialMediaTypes.SNAPCHAT:
      return `https://www.snapchat.com/add/${handle}`;
    case socialMediaTypes.FACEBOOK:
      return `https://www.facebook.com/${handle}`;

    default:
      return undefined;
  }
};

export const getSlackMessageFromContactUsData = (contactUsInfo) => {
  const {
    recipientName,
    name,
    contact,
    contact_has_whatsapp,
    email,
    message,
    social_handles,
  } = contactUsInfo || {};
  let slackBlockObject = { blocks: [] };
  recipientName
    ? slackBlockObject.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hi ${recipientName} You have gotten a Contact request`,
        },
      })
    : slackBlockObject.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hurry! We have Received a Contact request`,
        },
      });

  if (name || contact || email || message)
    slackBlockObject.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${name ? `*Name:* ${name}\n` : ""}${
          contact ? `*Contact:* ${contact}\n` : ""
        }${email ? `*Email:* ${email}\n` : ""}${
          message ? `*Message:* ${message}\n` : ""
        }`,
      },
    });

  if (contact_has_whatsapp || Array(social_handles).length > 0) {
    slackBlockObject.blocks.push({
      type: "divider",
    });

    slackBlockObject.blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Handles:* ${
          contact_has_whatsapp
            ? `<${getHandleLink(
                socialMediaTypes.WHATSAPP,
                contact
              )}|Whatsapp>, `
            : ""
        }${Array.from(social_handles)
          .map(
            ({ source, handle }) =>
              `<${getHandleLink(source, handle)}|${
                source.charAt(0).toUpperCase() + source.slice(1)
              }>`
          )
          .join(", ")}`,
      },
    });
  }

  let slackMessage = JSON.stringify(slackBlockObject);

  return slackMessage;
};

export const getSMSMessageFromContactUsData = (contactUsInfo) => {
  let SMS = "";
  const {
    name,
    contact,
    contact_has_whatsapp,
    email,
    message,
    social_handles,
  } = contactUsInfo || {};
  name && (SMS += `Name:  ${name}\n`);
  contact && (SMS += `Contact:  ${contact}\n`);
  email && (SMS += `Email:  ${email}\n`);
  message && (SMS += `Message:  ${message}\n`);
  SMS += "\nOther Contact Means:\n";
  contact &&
    contact_has_whatsapp &&
    (SMS += `Whatsapp: ${getHandleLink(socialMediaTypes.WHATSAPP, contact)}`);
  social_handles.forEach(({ source, handle }) => {
    SMS += `${
      source.charAt(0).toUpperCase() + source.slice(1)[1]
    }:  ${getHandleLink(source, handle)}`;
  });
  return SMS;
};
