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
  ForbiddenError,
} = require("../../core/error.response");
const { findShopByEmailRepo } = require("../models/repos/shop.repo");

class AccessService {
  /**
   * Xử lý làm mới token cho người dùng dựa trên refreshToken cung cấp.
   *
   * @param {object} params - Đối số chứa keyStore, thông tin người dùng, và refreshToken.
   * @param {object} params.keyStore - Thông tin lưu trữ của key token.
   * @param {object} params.user - Thông tin người dùng hiện tại.
   * @param {string} params.refreshToken - refreshToken cần được làm mới.
   * @returns {Promise<object>} - Một đối tượng chứa thông tin người dùng và cặp tokens mới.
   *
   * Quy trình xử lý:
   * 1. Kiểm tra xem refreshToken hiện tại đã được sử dụng trước đó hay chưa.
   *    - Nếu đã sử dụng, xóa keyToken tương ứng và báo lỗi yêu cầu đăng nhập lại.
   * 2. Kiểm tra refreshToken cung cấp có trùng khớp với refreshToken trong db không.
   *    - Nếu không hợp lệ, báo lỗi token không đúng.
   * 3. Tìm kiếm thông tin cửa hàng qua email.
   *    - Nếu không tìm thấy cửa hàng, báo lỗi cửa hàng không tồn tại.
   * 4. Tạo cặp tokens mới cho người dùng.
   * 5. Cập nhật refreshToken mới vào database và thêm refreshToken cũ vào danh sách đã sử dụng.
   *
   * Lưu ý:
   * - Mỗi lần làm mới token, refreshToken cũ sẽ được đánh dấu là đã sử dụng để ngăn việc tái sử dụng.
   */
  static handleRefreshToken = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;

    // 1. kiểm tra rfToken hiện tại có nằm trong danh sách rfToken đã sử dụng chưa
    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      //nếu rftoken đã sử dụng thì tiến hành delete
      await KeyTokenService.removeKeyTokenById(userId);
      throw new ForbiddenError("Something went wrong !, please login again !");
    }

    console.log("KEYSTORE::::::", keyStore);
    //2. kiểm tra rfToken truyền vào có hợp lệ không
    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Invalid Token");
    }

    //3. tìm kiếm shop thông qua email
    const foundShop = await findShopByEmailRepo({ email });
    if (!foundShop) {
      throw new BadRequestError("Shop is not existed !");
    }

    //4. khởi tạo cặp tokens cho phiên mới (accesstoken va refresh token)
    const newTokens = await createTokenPair(
      { userId, email },
      keyStore.privateKey,
      keyStore.publicKey
    );

    //5. update lại refreshToken trong db
    await keyStore.updateOne({
      $set: {
        refreshToken: newTokens.refreshToken, //đưa token mới vào db
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, //đưa token vừa sử dụng vào danh sách đã sử dụng
      },
    });

    return {
      user,
      tokens: newTokens,
    };
  };

  //==============================================================================================

  /**
   * Đăng xuất người dùng bằng cách xóa keyToken ra khỏi cơ sở dữ liệu.
   *
   * @param {object} keyStore - Thông tin về keyStore cần được đăng xuất.
   * @returns {Promise<null>} - Một promise đại diện cho quá trình đăng xuất thành công.
   *
   * Đặc điểm:
   * - Hàm này nhận vào một đối tượng keyStore, chứa thông tin về keyToken cần được đăng xuất.
   * - Sau khi xóa keyToken từ cơ sở dữ liệu, hàm trả về một promise với giá trị null, đại diện cho quá trình đăng xuất thành công.
   */
  static logout = async (keyStore) => {
    const keyDelete = await KeyTokenService.removeKeyTokenById(keyStore._id);
    return null;
  };

  //==============================================================================================

  /**
   * @param {object} params hàm nhận vào 1 object.
   * @param {string} params.email Email của cửa hàng cần đăng nhập.
   * @param {string} params.password Mật khẩu của cửa hàng cần đăng nhập.
   * @param {string|null} [params.refreshToken=null] Refresh token cũ (nếu có) để tạo mới cặp token.
   * @returns {Promise<Object>} Đối tượng chứa thông tin cửa hàng và tokens.
   * @throws {BadRequestError} Nếu cửa hàng không tồn tại trong cơ sở dữ liệu.
   * @throws {AuthFailureError} Nếu mật khẩu không đúng.
   *
   * Đăng nhập cho cửa hàng dựa trên email và mật khẩu.
   * Nếu được cung cấp, sẽ sử dụng refreshToken để tái tạo tokens.
   *
   * Quy trình đăng nhập bao gồm các bước sau:
   * 1. Kiểm tra xem cửa hàng có tồn tại trong cơ sở dữ liệu dựa trên email không.
   * 2. So sánh mật khẩu nhập vào với mật khẩu đã được mã hóa trong cơ sở dữ liệu.
   * 3. Tạo cặp khóa publicKey và privateKey ngẫu nhiên bằng cách sử dụng thư viện crypto.
   *    - publicKey được dùng để xác minh token.
   *    - privateKey được dùng để ký token.
   * 4. Khởi tạo cặp token mới (accessToken và refreshToken).
   * 5. Lưu thông tin về khóa vào cơ sở dữ liệu.
   * 6. Trả về thông tin cửa hàng và cặp tokens cho người dùng.
   */

  static login = async ({ email, password, refreshToken = null }) => {
    //1. check shop bằng mail
    const shopFound = await findShopByEmailRepo({ email });
    if (!shopFound) {
      throw new BadRequestError("Shop is not Registered");
    }
    //2. so sanh password
    const isCorrectPassword = BCRYPT.compare(password, shopFound.password);
    if (!isCorrectPassword) {
      throw new AuthFailureError("Authenticate Error");
    }
    //3. khởi tạo publicKey và privateKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    //4. khởi tạo cặp tokens cho phiên mới (accesstoken va refresh token)
    const { _id: userId } = shopFound;
    const tokensLogin = await createTokenPair(
      { userId, email },
      privateKey,
      publicKey
    );

    //5. Lưu keyToken info vào db
    await KeyTokenService.createKeyTokenV2({
      userId,
      privateKey,
      publicKey,
      refreshToken: tokensLogin.refreshToken,
    });

    return {
      shop: getDataInfoResponse(["_id", "name", "email"], shopFound),
      tokens: tokensLogin,
    };
  };

  //==============================================================================================

  /**
   * Đăng ký 1 shop
   *
   * @param {object} params hàm nhận vào 1 object.
   * @param {string} params.name tên của shop.
   * @param {email} params.email email của shop.
   * @param {string} params.password mật khẩu của shop.
   * @returns {Promise<Object>} Đối tượng trả về chứa thông tin cửa hàng và tokens.
   * @throws {BadRequestError} Cửa hàng đã tồn tại.
   * @throws {BadRequestError} Tạo khóa public thất bại.
   * @throws {BadRequestError} Tạo token thất bại.
   *
   * Quy trình đăng nhập bao gồm các bước sau:
   * 1. check shop existed
   * 2. hash password and store user info to dbs
   * 3. generate publicKey and privateKey with random values generated by crypto
   * 4. store public key and private key to dbs
   * 5. generate token pair to make new session
   * 6. get data info response
   */
  static signUp = async ({ name, email, password }) => {
    //1. check shop existed
    const shopExisted = await shopModel.findOne({ email: email }).lean();
    // => lean ở đây có tác dụng thu gọn data response trả về đúng chuẩn js object
    if (shopExisted) {
      //case: shop existed
      throw new BadRequestError("Shop Already Existed !");
    }

    //2. hash password and store user info to dbs
    // Password lưu vào dbs không thể giữ nguyên dạng mà phải mã hóa
    const passwordHashed = await BCRYPT.hash(password, 10);

    // Update user info vào dbs
    const newShop = await shopModel.create({
      name: name,
      email,
      password: passwordHashed,
      roles: [ROLESHOP.SHOP],
    });

    if (newShop) {
      //3. generate publicKey and privateKey with random values generated by crypto
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      //4. store public key and private key to dbs
      const publicKeyToken = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!publicKeyToken) {
        throw new BadRequestError(
          "Something went wrong when generate public key !"
        );
      }

      //5. generate token pair to make new session
      const tokens = await createTokenPair(
        { shop: newShop._id, email },
        privateKey,
        publicKey
      );

      if (!tokens) {
        throw new BadRequestError(
          "Something went wrong when generate tokens !"
        );
      }

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
