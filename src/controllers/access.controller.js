"use strict";

const AccessService = require("../services/access.service");
const { Created } = require("../../core/success.response");
class AccessController {
  signUp = async (req, res, next) => {
    new Created({
      message: "Registered Successfully!",
      metadata: await AccessService.signUp(req.body),
      options: {
        limit: 15,
      },
    }).send(res); // Sau khi xử lý xong thì trả về response cho user
  };

  login = async (req, res, next) => {
    new Created({
      message: "Logged In Successfully!",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };
}

module.exports = new AccessController();
