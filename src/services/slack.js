import _ from "underscore";
import { getCustomError } from "../utils/vrkcreations.js";


export const sendSlackMessage = (apiKey, message)=>{
if(_.isArray(apiKey)){
    Array.from(apiKey).forEach(key=>{
        sendSlackMessage(key, message);
    })
    return;
}
    try {
    const apiUrl = `https://hooks.slack.com/services/${apiKey}`;
        
     fetch(apiUrl, {
       method: "POST",
       body: message,
       headers: { "Content-Type": "application/json" },
     })
       .then((res) => res.text())
       .then((res) => {
         if (res === "ok") {
           //todo: add some logging here
         }
       })
       .catch((err) => {
         console.log(err.message);
       });
    } catch (error) {
        throw getCustomError(`services/sendSlackMessage: ${error.message}`,error);
    }
}