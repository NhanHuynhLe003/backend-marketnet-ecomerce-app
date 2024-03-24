"use strict";

const apiKeyModel = require("../models/apiKey.model");
const crypto = require("crypto");
const { API_PERMISSION_CODE } = require("../constants");

const generateApiKey = async () => {
  const generateKey = crypto.randomBytes(64).toString("hex");
  const newKey = await apiKeyModel.create({
    key: generateKey,
    permissions: [API_PERMISSION_CODE.ROLE1],
  });

  return newKey;
};

const findApiKey = async (key) => {
  // Khởi tạo Key Mới
  // const newKey = await generateApiKey();
  // console.log("NEW API KEY::: ", newKey);
  const objectKey = await apiKeyModel.findOne({ key, status: true }).lean();
  return objectKey;
};

module.exports = {
  findApiKey,
  generateApiKey,
};
