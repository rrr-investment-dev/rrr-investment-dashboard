import express from "express";
const Router = express.Router();
import * as usersController from "./controllers/usersController.js";
import * as userRoleTypeController from "./controllers/userRoleTypeMaster.js";
import * as authController from "./controllers/authController.js";
import * as authMiddleware from "./../../../../common/middlewares/authMiddleware.js";

// Routes for User role type master

Router.route("/RoleTypeMaster")
  .get(authMiddleware.protect, userRoleTypeController.getTypeAll)
  .post(authMiddleware.protect, userRoleTypeController.createType);

Router.route("/RoleTypeMaster/:id")
  .get(authMiddleware.protect, userRoleTypeController.getTypeById)
  .patch(authMiddleware.protect, userRoleTypeController.updateTypeById);

Router.patch(
  "/RoleTypeMaster/inactive/:id",
  authMiddleware.protect,
  userRoleTypeController.inActiveTypeById
);

// Routes for User

Router.route("/")
  .post(authMiddleware.protect, usersController.createUser)
  .get(authMiddleware.protect, usersController.getAllUsers);

Router.route("/:id")
  .get(authMiddleware.protect, usersController.getUserById)
  .patch(authMiddleware.protect, usersController.updateUserById);

Router.patch(
  "/inactive/:id",
  authMiddleware.protect,
  usersController.inActiveUserById
);

// Route for User login

Router.post("/auth/request-otp", authController.requestOTP);
Router.post("/auth/verify-otp", authController.verityOTP);
Router.post("/auth/refresh-token", authController.refreshToken);
Router.post("/auth/logout", authMiddleware.protect, authController.logout);

export default Router;
