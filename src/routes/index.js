const express = require("express");
const router = express.Router();
const { apiKey, checkPermission } = require("../auth/check-auth");
const { API_PERMISSION_CODE } = require("../constants");

//check api key
router.use(apiKey);

//check permission
router.use(checkPermission(API_PERMISSION_CODE.ROLE1));

router.use("/v1/api/product", require("./product"));
router.use("/v1/api", require("./access"));

module.exports = router;
