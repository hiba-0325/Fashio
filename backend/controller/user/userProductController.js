const product = require("../../models/schema/productSchema");

//get all products
const getAllProduct = async (req, res) => {
  const allProduct = await product.find();

  res.status(200).json({
    status: "success",
    message: "all product get successfully",
    data: allProduct,
  });
};

const getProductType = async (req, res) => {
  const type = req.params.type;
  const productType = await product.find({ type });
  res.status(200).json({
    status: "success",
    message: "product get by type successfully",
    data: productType,
  });
};

const getProductById = async (req, res) => {
  const _id = req.params.id;
  const ProductId = await product.findById(_id);
  res.status(200).json({
    status: "success",
    message: "product get by id successfully",
    data: ProductId,
  });
};

module.exports = { getAllProduct, getProductType, getProductById };
