const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";
// Declare the Schema of the Mongo model
var shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // Tình trạng hoạt động của shop
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    // Yêu cầu xác thực
    verify: {
      type: mongoose.Schema.Types.Boolean,
      default: false,
    },

    // Shop sẽ được cấp những quyền gì
    roles: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);
