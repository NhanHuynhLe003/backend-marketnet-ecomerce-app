const app = require("./src/app");
const PORT = process.env.PORT || 3056; // Không khai báo PORT trong env thì mặc định chạy trên PORT 3056

const server = app.listen(PORT, () => {
  console.log(`Server Ecomerce is running on port ${PORT}`);
});

// Lắng nghe ctrc + C để hủy kết nối
process.on("SIGINT", () => {
  server.close(() => console.log("Server Ecomerce closed !"));
});
