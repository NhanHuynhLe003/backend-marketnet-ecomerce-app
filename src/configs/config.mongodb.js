require("dotenv").config();

const dev = {
  app: {
    port: process.env.DEV_APP_PORT || 3050,
  },
  db: {
    host: process.env.DEV_DB_HOST || "localhost",
    name: process.env.DEV_DB_NAME || "ecomerceAppDEV",
    port: process.env.DEV_DB_PORT || 27017,
  },
};

const prod = {
  app: {
    port: process.env.PROD_APP_PORT || 3000,
  },
  db: {
    host: process.env.PROD_DB_HOST || "localhost",
    name: process.env.PROD_DB_NAME || "ecomerceAppPROD",
    port: process.env.PROD_DB_PORT || 27017,
  },
};

const config = { dev, prod };
const env = process.env.NODE_ENV || "dev"; //mac định thì config không thiết lập môi trường sẽ lấy theo dev
module.exports = config[env];
