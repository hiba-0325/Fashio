const express = require("express");
const tryCatch = require("../utils/tryCatch");
const loginController = require("../controller/auth/authController");
const routes = express.Router();

routes
  .post("/signup", tryCatch(loginController.userReg))
  .post("/login", tryCatch(loginController.userLogin))
  .post("/admin-login", tryCatch(loginController.adminLogin))
  .post("/logout", tryCatch(loginController.userLogout));

module.exports = routes;
