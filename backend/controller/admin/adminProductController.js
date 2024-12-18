const product = require("../../models/schema/productSchema");
const customError = require("../../utils/customError");
const joischema = require("../../models/joischema/validation");

// create product
const createProduct = async (req, res, next) => {
  const { value, error } = joischema.joiproductSchema.validate(req.body);
  if (error) {
    return next(new customError(error.details[0].message, 400));
  }
  if (!req.file || !req.file.path) {
    return next(new customError("Image not found", 400));
  }
  const newProduct = new product({
    ...value,
    image: req.file.path,
  });
  if (!newProduct) {
    return next(new customError("Product not created", 500));
  }
  await newProduct.save();
  res.status(201).json({
    message: "product created successfully",
  });
};
// update product
const updateProduct = async (req, res, next) => {
  const newProduct = await product.findById(req.params.id);
  if (!newProduct) {
    return next(new customError("Product not found", 404));
  }
  //update product image if uploaded new image
  let image = newProduct.image;
  if (req.file) image = req.file.path;
  newProduct.set({
    ...req.body,
    image: image,
  });
  await newProduct.save();
  res.status(200).json({
    message: "product updated successfully",
  });
};

// delete product but move bin
const deleteProduct = async (req, res, next) => {
  const deleteProduct = await product.findByIdAndUpdate(
    req.params.id,
    { $set: { isDeleted: true } },
    { new: true }
  );
  if (!deleteProduct) return next(new customError("Product not found", 404));
  res.status(200).json({
    message: "product deleted successfully",
  });
};
// completly delete product
const deleteProductfromBin = async (req, res, next) => {
  const deletedProduct = await product.findByIdAndDelete(req.params.id);
  if (!deletedProduct) return next(new customError("Product not found", 404));
  res.status(200).json({
    message: "product deleted successfully",
  });
};
// get all products
const getAllProducts = async (req, res, next) => {
  const products = await product.find();
  if (!products) return next(new customError("Products not found", 404));
  res.status(200).json({
    message: "products found successfully",
    data: products,
  });
};
// get single product
const getSingleProduct = async (req, res, next) => {
  const singleProduct = await product.findById(req.params.id);
  if (!singleProduct) return next(new customError("Product not found", 404));
  res.status(200).json({
    message: "product found successfully",
    data: singleProduct,
  });
};

//get product by category
const getProductByCategory = async (req, res, next) => {
  const products = await product.find({type: req.params.type });
  if (!products) return next(new customError("Products not found", 404));
  res.status(200).json({
    message: "products found successfully",
    data: products,
  });
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductfromBin,
  getAllProducts,
  getSingleProduct,
  getProductByCategory,
};
