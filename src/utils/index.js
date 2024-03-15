const lodash = require("lodash");

/**
 * Lọc thông tin data response.
 *
 * @param {Array} dataFields - Mảng chứa tên các trường dữ liệu cần lấy.
 * @param {Object} object - Đối tượng chứa dữ liệu cần lấy thông tin.
 * @returns {Object} - Đối tượng mới chỉ chứa các trường dữ liệu đã lấy.
 */
const getDataInfoResponse = (dataFields, object) => {
  return lodash.pick(object, dataFields);
};

module.exports = {
  getDataInfoResponse,
};
