"use strict";

const JWT = require("jsonwebtoken");

const createTokenPair = async (payload, privateKey, publicKey) => {
  try {
    /**
     JWT được ký bằng privateKey của đơn vị phát hành (issuer) để đảm bảo rằng nó không bị chỉnh 
     sửa khi truyền qua mạng, và cũng để đảm bảo tính toàn vẹn của dữ liệu
     */
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    /**
     Hàm JWT.verify sẽ sử dụng khóa công khai (public key) để kiểm tra tính hợp lệ của mã thông báo 
     truy cập này.

     Nếu mã thông báo truy cập hợp lệ, hàm JWT.verify sẽ gọi lại (callback) với tham số decode chứa 
     thông tin giải mã từ mã thông báo truy cập.
     */

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log("failed to verify token:: ", err);
      } else {
        console.log("success to decode verify token:: ", decode);
      }
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (err) {
    return err;
  }
};

module.exports = {
  createTokenPair,
};
