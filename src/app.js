const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const app = express();
const bodyParser = require("body-parser");

// Khởi tạo middleware
app.use(morgan("dev")); //in ra log của user khi chạy request
app.use(helmet()); // bảo mật ứng dụng

app.use(compression()); //nén dữ liệu tránh tiêu tốn băng thông khi gửi request

// response trả về dạng json
app.use(express.json());
bodyParser.urlencoded({
  extended: true,
});
// khởi tạo dbs
require("./db/init.mongodb");

// khởi tạo routes
app.use("/", require("./routes"));
module.exports = app;
