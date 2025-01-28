import { Router } from "express";
import { db } from "../services/mongoDB.js";
import { collections } from "../constants/DB.js";
import { Response, STATUS } from "../model/response.js";
import { ObjectId } from "mongodb";
import { authRoles } from "../constants/auth.js";

const dataRouter = Router();

dataRouter.get("/user", async (req, res) => {
  try {
    if (req.user) {
      let user = await db
        .collection(collections.AUTH_USERS)
        .findOne({ _id: new ObjectId(req.user.id) });
      console.log("Users:", req.user, user);

      if (!user) {
        return res.status(200).json(
          new Response({
            status: STATUS.ERROR,
            message: "User not found in database",
          })
        );
      }
      const { name, avatar, email, phone, roles } = user;

      res.status(200).json(
        new Response({
          status: STATUS.SUCCESS,
          data: { name, avatar, email, phone, roles },
        })
      );
    } else {
      res.status(200).json(
        new Response({
          status: STATUS.UNAUTHORIZED,
          message: "User not logged in",
        })
      );
    }
  } catch (error) {
    console.log(error);

    res.status(500).json(
      new Response({
        status: STATUS.ERROR,
        message: error.message,
      })
    );
  }
});

dataRouter.put("/user", async (req, res) => {
  try {
    const { name, avatar } = req.body;
    let user;
    if (req.user) {
      user = await db.collection(collections.AUTH_USERS).findOne({
        _id: new ObjectId(req.user.id),
      });

      if (!user) {
        return res.status(200).json(
          new Response({
            status: STATUS.SUCCESS,
            data: {},
          })
        );
      } else {
        if (name.match(/([\w]{3,50})/g)) {
          user.name = name;
        }
        if(Array.isArray(avatar) ){
          user.avatar = [...avatar];
        }
        await db
          .collection(collections.AUTH_USERS)
          .updateOne(
            { _id: new ObjectId(req.user.id) },
            { $set: { ...user } }
          ).then((result) => {
            console.log(result);
          });
        res.status(200).json(
          new Response({
            status: STATUS.SUCCESS,
            message: "User updated",
            data: { name, avatar },
          })
        );
      }
    } else {
      res.status(200).json(
        new Response({
          status: STATUS.UNAUTHORIZED,
          message: "User not logged in",
        })
      );
    }
  } catch (error) {}
});

export default dataRouter;
