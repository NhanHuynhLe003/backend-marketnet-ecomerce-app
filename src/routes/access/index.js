const express = require("express");
const AccessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandleError } = require("../../auth/check-auth");
//sign-up
router.post("/shop/sign-up", asyncHandleError(AccessController.signUp));

//login
router.post("/shop/login", asyncHandleError(AccessController.login));

module.exports = router;
