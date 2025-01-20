import { Router } from "express";
import Passport from "../services/auth.js";
import { handleGoogleLoginSuccuss } from "../controllers/auth.js";
import { ensureLoggedIn } from "connect-ensure-login";
import { sendWhatsappOtp } from "../services/whatsapp.js";
import { Response, STATUS } from "../model/response.js";

const authRouter = Router();

authRouter.get(
  "/",
  ensureLoggedIn({
    redirectTo: `${process.env.LOGIN_PAGE_URL || "/api/auth/google"}`,
    setReturnTo: true,
  }),
  (req, res) => {
    console.log(req.user); 

    res.status(200).send("authRouter:ok");
  }
);

authRouter.get("/is_logged_in", (req, res) => {
  if (req.user) {
    const { name, avatar,roles, ...restData } = req.user;
    return res.status(200).json({ name, avatar,roles });
  } else {
    return res.status(401).send("false");
  }
});

// google
authRouter.get(
  "/google",
  Passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);

authRouter.get(
  "/google/redirect",
  Passport.authenticate("google", {
    failureRedirect: "/api/auth",
  }),
  handleGoogleLoginSuccuss
);

//phone
authRouter.get("/phone", (req, res) => {
  res.status(200).send("authRouter:phone login page");
});

authRouter.post("/phone/otp", async (req, res) => {
  let otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  const { number, organization = "VRK Creations" } = req.body;

  req.session.otp = otp;
  req.session.number = number;
  await sendWhatsappOtp(number, otp, organization)
    .then(async (d) => {
      console.log(d.status);
      if (d.status === STATUS.SUCCESS) {
        res.status(200).json(
          new Response({
            status: STATUS.SUCCESS,
            message: d.message,
          })
        )
        res.responseSent = true;
      } else {
        res.status(500).json(
          new Response({
            status: STATUS.ERROR,
            message: d.message,
          })
        );
        res.responseSent = true;
      }
      
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json(
        new Response({
          status: STATUS.ERROR,
          message: error.message,
        })
      );
      res.responseSent = true;
    });
  if (!res.responseSent)
    return res
      .status(500)
      .send(new Response({ status: STATUS.ERROR, message: "Unknown error" }));
});

authRouter.post(
  "/phone/verify",
  Passport.authenticate("phone", { failureRedirect: "/api/auth" }),
  (req, res) => {
    if (req.user) {
      res
        .status(200)
        .json(
          new Response({ status: STATUS.SUCCESS, message: "Phone verified" })
        );
    }
  }
);

export default authRouter;
