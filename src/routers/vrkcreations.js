import { Router } from "express";
import {
  handleContactUs,
  handleSendContactUsUsers,
} from "../controllers/vrkcreations.js";

const vrkCreationsRouter = Router();

vrkCreationsRouter.get("/get_contact_us_users", handleSendContactUsUsers);

vrkCreationsRouter.post("/contact_us", handleContactUs);

export default vrkCreationsRouter;
