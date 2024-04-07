const express = require("express");
const router = express.Router();

const ProductController = require("../../controllers/product.controller");
const { asyncHandleError } = require("../../auth/check-auth");

router.post("", asyncHandleError(ProductController.createProduct));

module.exports = router;
