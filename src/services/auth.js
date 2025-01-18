import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { Strategy as CustomStrategy } from "passport-custom";
import { db } from "./mongoDB.js";
import { collections } from "../constants/DB.js";
import { getCustomError, isCustomError } from "../utils/vrkcreations.js";
import { triggerErrorInSentry } from "./sentry.js";
import { getUserData } from "./whatsapp.js";
import { Response, STATUS } from "../model/response.js";
import { ensureLoggedIn } from "connect-ensure-login";

passport.serializeUser(function (user, cb) {
  let sterilizedUser;
  if (user.source === "google") {
    sterilizedUser = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar[0],
    };
  } else {
    sterilizedUser = { ...user, source: undefined };``
  }
  process.nextTick(() => {
    cb(null, sterilizedUser);
  });
});

passport.deserializeUser((obj, cb) => {
  console.log("deserializing user", obj);
  process.nextTick(() => {
    cb(null, obj);
  });
});

passport.use(
  new Strategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: `${process.env.GOOGLE_CLIENT_CALLBACK}`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db.collection(collections.AUTH_USERS).findOne({
          email: profile._json.email,
        });
        if (user) {
          return done(null, user);
        } else {
          user = {
            email: profile._json.email,
            phone: { hasPhoneNumber: false },
            name: profile._json.name,
            avatar: [profile._json.picture],
            roles: ["user"],
            googleData: JSON.stringify({
              ...profile._json,
              accessToken,
              refreshToken,
              provider: profile.provider,
              username: profile.username,
            }),
            extraData: JSON.stringify({}),
          };
          let userId = await db
            .collection(collections.AUTH_USERS)
            .insertOne(user);
          user._id = userId.insertedId;
          user.source = "google";
          return done(null, user);
        }
      } catch (error) {
        done(error, null);
        triggerErrorInSentry(
          isCustomError(error)
            ? error
            : getCustomError(`services/auth:${error.message}`, error)
        );
      }
    }
  )
);

passport.use(
  "phone",
  new CustomStrategy(async (request, done) => {
    try {
      if (!request.body?.number) {
        request.res.isResponseSent = true;

        request.res.status(401).json(
          new Response({
            status: STATUS.ERROR,
            message: "Phone number is required",
          })
        );

        return done(getCustomError("Phone number is required"), {});
      }
      if (!request.body?.otp) {
        request.res.isResponseSent = true;

        request.res.status(401).json(
          new Response({
            status: STATUS.ERROR,
            message: "OTP is required",
          })
        );

        return done(getCustomError("OTP is required"), {});
      }

      // check number and country code formats
      if (!!request.body?.number) {
        if (!request.body?.number.replace(" ", "").match(/^\d{10,11}$/)) {
          console.log("Invalid phone number");
          request.res.isResponseSent = true;

          request.res.status(401).json(
            new Response({
              status: STATUS.ERROR,
              message: "Invalid phone number",
            })
          );
          return done(getCustomError("Invalid phone number"));
        }
      }
      if (request.body.otp !== request.session.otp) {
        console.log(request.body.otp, request.session.id);

        request.res.isResponseSent = true;
        request.res.status(401).json(
          new Response({
            status: STATUS.ERROR,
            message: "Invalid OTP",
          })
        );

        return done(getCustomError("Invalid OTP"), {});
      }

      request.session.otp = null;
      request.session.number = null;

      const userData = await getUserData(request.body.number);
      
      let user;
      if (!!userData) {
        await db
          .collection(collections.AUTH_USERS)
          .findOne({ "phone.contact": request.body.number })
          .then(async (user) => {
            if (user) {
              return done(null, {
                id: user._id,
                number: request.body.number,
                verified: true,
                name: user.name,
                roles: [...user.roles],
                avatar: [...user.avatar],
              });
            } else {
              user = {
                phone: {
                  contact: request.body.number,
                  verified: true,
                  hasPhoneNumber: true,
                },
                name: userData.name || "USER",
                extraData: JSON.stringify({}),
                roles: ["user"],
                avatar: [userData.avatar],
                source: "phone",
                googleData: JSON.stringify({}),
              };
              let userId = await db
                .collection(collections.AUTH_USERS)
                .insertOne({
                  ...user,
                });
              user.id = userId.insertedId;
            }
          });
      }
      console.log("user:",user);
      

      return done(null, {
        number: request.body.number,
        verified: true,
        ...user,
      });
    } catch (error) {
      console.log(error);
      request.res.status(401).json(
        new Response({
          status: STATUS.ERROR,
          message: "Something went wrong",
        })
      );

      done(error, null);
      triggerErrorInSentry(
        isCustomError(error)
          ? error
          : getCustomError(`services/auth:${error.message}`, error)
      );
    }
  })
);

export const ensureLogIn = ensureLoggedIn(process.env.LOGIN_FAILURE_FALLBACK);

const Passport = passport;

export default Passport;
