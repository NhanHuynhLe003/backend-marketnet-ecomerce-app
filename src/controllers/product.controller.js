"use strict";
const ProductService = require("../services/products.service");
const { Created } = require("../../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    new Created({
      message: "Create New Product Successfully!",
      metadata: await ProductService.createProduct(
        req.body.product_type,
        req.body
      ),
    }).send(res);
  };
}

module.exports = new ProductController();
