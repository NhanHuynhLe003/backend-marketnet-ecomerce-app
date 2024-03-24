"use strict";

const keyTokenModel = require("../models/keyToken.model");

/**
 * Service for managing key tokens.
 */
class KeyTokenService {
  /**
   * Creates a new key token.
   * @param {string} userId - The ID of the user.
   * @param {string} publicKey - The public key.
   * @returns {Promise<string|null>} The created key token's public key, or null if creation failed.
   */
  static createKeyToken = async ({ userId, publicKey, refreshToken }) => {
    try {
      const publicKeyConvertStr = publicKey.toString();
      // console.log("PUBLIC KEY CONVERT STR::: ", publicKeyConvertStr);
      const tokens = await keyTokenModel.create({
        user: userId,
        publicKey: publicKeyConvertStr,
      });
      // Tokens sau khi upload db thì attr publicKey lúc này chính là publicKeyString
      // Đã lưu publicToken là 1 publicKeyStr thì phải lấy publicKey từ token trả về
      // Có thể sẽ đặt ra câu hỏi tại sao không trả về publicKeyString luôn mà phải trả về publicKey từ token
      // Để tránh trường hợp publicKeyString không được lưu vào db
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static createKeyTokenV2 = async ({ userId, publicKey, refreshToken }) => {
    try {
      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshToken,
        refreshTokensUsed: [],
      };

      // options dùng để tạo mới nếu chưa có document nào thỏa mãn filter và update nếu có rồi
      const options = { upsert: true, new: true };

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };
}
module.exports = KeyTokenService;
