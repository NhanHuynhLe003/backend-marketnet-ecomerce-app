const mongoose = require("mongoose"); // Erase if already required
const { API_PERMISSION_CODE } = require("../constants");
const DOCUMENT_NAME = "ApiKey";
const COLLECTION_NAME = "ApiKeys";
// Declare the Schema of the Mongo model
const apiKeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: [
        API_PERMISSION_CODE.ROLE1,
        API_PERMISSION_CODE.ROLE2,
        API_PERMISSION_CODE.ROLE3,
      ],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, apiKeySchema);
