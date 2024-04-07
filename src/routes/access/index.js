const express = require("express");
const AccessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
const { authentication } = require("../../auth/auth-util");
//sign-up
router.post("/shop/sign-up", asyncHandleError(AccessController.signUp));

//login
router.post("/shop/login", asyncHandleError(AccessController.login));

//các url bên dưới authentication đều phải xác thực mới được truy cập
router.use(authentication);
//logout
router.post("/shop/logout", asyncHandleError(AccessController.logout));

//refresh token
router.post(
  "/shop/refresh-token",
  asyncHandleError(AccessController.handleRefreshToken)
);

module.exports = router;
