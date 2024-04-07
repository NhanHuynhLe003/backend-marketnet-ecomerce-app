const mongoose = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";
// Declare the Schema of the Mongo model
let productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_thumb: {
      type: String,
      required: true,
    },
    product_desc: String,
    product_slug: String,
    product_price: {
      type: Number,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: true,
    },
    product_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furnitures"],
      // them loai san pham thi can phai them vao enum
    },
    product_shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    product_attributes: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

let clothingSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      require: true,
    },
    size: String,
    material: String,
    product_shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    timestamps: true,
    collection: "clothes",
  }
);

let electronicSchema = new mongoose.Schema(
  {
    manufacturer: {
      type: String,
      require: true,
    },
    model: String,
    color: String,
    product_shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    timestamps: true,
    collection: "electronics",
  }
);

let funitureSchema = new mongoose.Schema(
  {
    brand: { type: String, require: true },
    size: String,
    material: String,
    product_shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
  },
  {
    timestamps: true,
    collection: "funitures",
  }
);

//Export the model
module.exports = {
  productModel: mongoose.model(DOCUMENT_NAME, productSchema),
  electronicModel: mongoose.model("Electronics", electronicSchema),
  clothingModel: mongoose.model("Clothing", clothingSchema),
  funitureModel: mongoose.model("Furnitures", funitureSchema),
};
