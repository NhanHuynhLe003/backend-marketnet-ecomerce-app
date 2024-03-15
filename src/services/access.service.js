"use strict";

const shopModel = require("../models/shop.model");
const BCRYPT = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/auth-util");
const { getDataInfoResponse } = require("../utils");

const ROLESHOP = {
  ADMIN: "ROLE-001",
  WRITER: "ROLE-002",
  EDITOR: "ROLE-003",
  SHOP: "ROLE-004",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      /**
       * 1. check shop is existed?
       * 2. shop isn't existed => create new shop
       * 2.1 when create new shop, password must be hash to secure database
       *      to hash password => using "bcrypt" library
       * 3. wait until new shop created => generate privateKey and publicKey
       *    by using "crypto" library
       *
       */
      const shopExisted = await shopModel.findOne({ email: email }).lean();
      // => lean ở đây có tác dụng thu gọn data response trả về đúng chuẩn js object
      if (shopExisted) {
        //case: shop existed
        return {
          code: "X-0001",
          message: "Shop already registered !",
        };
      }
      const passwordHashed = await BCRYPT.hash(password, 10);

      const newShop = await shopModel.create({
        name: name,
        email,
        password: passwordHashed,
        roles: [ROLESHOP.SHOP],
      });

      if (newShop) {
        // Khởi tạo public key và private key theo phương thức mã hóa RSA(bất đối xứng)
        // Sau khi khởi tạo PrivateKey không được lưu vào db nhưng PublicKey sẽ phải chuyển sang
        // Json String để lưu vào db
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096, //độ dài của khóa
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        });
        // console.log({ privateKey, publicKey });
        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });

        if (!publicKeyString) {
          return {
            code: "X-0000",
            message: "Failed to create public key",
          };
        }
        const publicKeyObj = crypto.createPublicKey(publicKeyString);

        // console.log("PUBLIC KEY OBJ::: ", publicKeyObj);
        // Tạo ra cặp tokens
        const tokens = await createTokenPair(
          { shop: newShop._id, email },
          privateKey,
          publicKeyObj
        );

        // console.log("TOKENS::: ", tokens);

        return {
          code: 201,
          metadata: {
            shop: getDataInfoResponse(["_id", "name", "email"], newShop),
            tokens,
          },
        };
      }
      return {
        code: 200,
        metadata: null,
      };
    } catch (err) {
      console.error(err.message);
      return {
        code: "ERR-ACCESS-XXX",
        message: err.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
