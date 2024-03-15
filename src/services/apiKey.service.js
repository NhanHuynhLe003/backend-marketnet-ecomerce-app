const apiKeyModel = require("../models/apiKey.model");
const crypto = require("crypto");

const findApiKey = async (key) => {
  //API Key sẽ được tạo ra khi người dùng đăng ký tài khoản, tạo hàm nếu chưa có key thì tạo mới
  const objectKey = await apiKeyModel.findOne({ key, status: true }).lean();
  if (!objectKey) {
    const generateKey = crypto.randomBytes(64).toString("hex"); //Tạo ra key ngẫu nhiên theo chuẩn hex
    const newKey = await apiKeyModel.create({
      key: generateKey,
      permissions: ["0000"], //quyền mặc định khi tạo mới key, sau này gửi bảng xem riêng
    });
    return newKey;
  }

  return objectKey;
};

module.exports = {
  findApiKey,
};
