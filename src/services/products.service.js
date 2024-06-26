"use strict";
const { BadRequestError } = require("../../core/error.response");
const {
  clothingModel,
  electronicModel,
  funitureModel,
  productModel,
} = require("../models/products.model");

//Định nghĩa Factory
class ProductFactory {
  static async createProduct(type, payload) {
    switch (type) {
      case "Clothing":
        return new Clothes(payload).createProduct();
      case "Electronics":
        return new Electronic(payload).createProduct();
      case "Funitures":
        return new Funiture(payload).createProduct();
      default:
        throw new Error("Invalid Type Product");
    }
  }
}

class Product {
  constructor({
    product_name,
    product_type,
    product_price,
    product_shop,
    product_thumb,
    product_desc,
    product_quantity,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_type = product_type;
    this.product_price = product_price;
    this.product_shop = product_shop;
    this.product_thumb = product_thumb;
    this.product_desc = product_desc;
    this.product_quantity = product_quantity;
    this.product_attributes = product_attributes;
  }

  //Tạo sản phẩm
  async createProduct(productId) {
    //Id của subProduct phải trùng với id Product cha
    return await productModel.create({ ...this, _id: productId });
  }
}

class Clothes extends Product {
  //create clothes for clothes Collection
  // Clothes sẽ override lại phương thức createProduct của Product
  async createProduct() {
    const newClothes = await clothingModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothes) throw new BadRequestError("Failed to create new clothes");

    // Tạo Product cho kho sản phẩm chính
    const newProduct = await super.createProduct(newClothes._id);
    if (!newProduct) throw new BadRequestError("Failed to create new product");

    return newProduct;
  }
}

class Electronic extends Product {
  //create clothes for clothes Collection
  async createProduct() {
    const newElectronic = await electronicModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic)
      throw new BadRequestError("Failed to create new Electronic");

    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Failed to create new product");

    return newProduct;
  }
}

class Funiture extends Product {
  //create clothes for clothes Collection
  async createProduct() {
    const newFuniture = await funitureModel.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFuniture)
      throw new BadRequestError("Failed to create new Funiture");

    const newProduct = await super.createProduct(newFuniture._id);
    if (!newProduct) throw new BadRequestError("Failed to create new product");

    return newProduct;
  }
}

module.exports = ProductFactory;
