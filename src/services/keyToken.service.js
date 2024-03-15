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
  static createKeyToken = async ({ userId, publicKey }) => {
    try {
      const publicKeyConvertStr = publicKey.toString();
      // console.log("PUBLIC KEY CONVERT STR::: ", publicKeyConvertStr);
      const tokens = await keyTokenModel.create({
        user: userId,
        publicKey: publicKeyConvertStr,
      });
      // Tokens sau khi upload db thì attr publicKey lúc này chính là publicKeyString
      // Đã lưu publicToken là 1 publicKeyStr thì phải lấy publicKey từ token trả về
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };
}
module.exports = KeyTokenService;
