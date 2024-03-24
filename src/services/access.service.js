"use strict";

const shopModel = require("../models/shop.model");
const BCRYPT = require("bcrypt");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/auth-util");
const { getDataInfoResponse } = require("../utils");
const { ROLESHOP } = require("../constants");
const {
  BadRequestError,
  AuthFailureError,
} = require("../../core/error.response");
const { findShopByEmailRepo } = require("../models/repos/shop.repo");

class AccessService {
  static login = async ({ refreshToken, email, password }) => {
    /**
     * 1. check shop existed
     * 2. check password is matched
     * 3. create publicKey and privateKey
     * 4. generate tokens pair (in login ! signUp, we must generate token pair before save rfToken to db)
     * 5. save refresh token, publicKey to db
     * 6. get data info response
     */

    //1. check shop existed
    const shopExisted = await findShopByEmailRepo({ email });

    if (!shopExisted) {
      throw new BadRequestError("Shop Is Not Existed !");
    }

    //2. check password is matched by compare password input with password hashed in db
    const isMatchedPassword = await BCRYPT.compare(
      password,
      shopExisted.password
    );
    if (!isMatchedPassword) {
      throw new AuthFailureError("Failed to Authenticate !");
    }

    //3. create publicKey and privateKey to make new session
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

    //4. generate new tokens pair, publicKeyString still not save to db keyToken => use publicKey
    // Keytoken đã lưu cả rfToken và publicKey vào db nhưng dù hacker có lấy được rfToken thì cũng không đăng nhập được vì password phải match
    const tokens = await createTokenPair(
      { shop: shopExisted._id, email },
      privateKey,
      publicKey
    );

    //5. save refresh token, publicKey to db, createKeyTokenV2 sẽ lưu cả refreshToken vào db
    await KeyTokenService.createKeyTokenV2({
      publicKey,
      refreshToken,
      userId: shopExisted._id,
    });

    //6. get data info response
    return {
      shop: getDataInfoResponse(["_id", "name", "email"], shopExisted),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    const shopExisted = await shopModel.findOne({ email: email }).lean();
    // => lean ở đây có tác dụng thu gọn data response trả về đúng chuẩn js object
    if (shopExisted) {
      //case: shop existed
      throw new BadRequestError("Shop Already Existed !");
    }

    // Password lưu vào dbs không thể giữ nguyên dạng mà phải mã hóa
    const passwordHashed = await BCRYPT.hash(password, 10);

    // Update vào dbs
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
        throw new BadRequestError(
          "Something went wrong when generate public key !"
        );
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
        shop: getDataInfoResponse(["_id", "name", "email"], newShop),
        tokens,
      };
    }
    return {
      code: 200,
      metadata: null,
    };
  };
}

module.exports = AccessService;
