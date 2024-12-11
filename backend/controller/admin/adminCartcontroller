const Cart = require("../../modles/schema/cartSchema");
const customError = require("../../utils/customError");

//all carts

const getAllCarts = async (req, res, next) => {
  const carts = await Cart.find();
  res.status(200).json({
    status: "success",
    data: carts,
  });
  if (!carts) {
    return next(new customError("No carts found", 404));
  }
};

//single user cart

const getSingleCartById = async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.params.id }).populate({
    path: "products.productId",
    select: "name price image",
  });
  if (!cart) {
    return next(new customError("No cart found", 404));
  }
  res.status(200).json({ cart });
};

module.exports = {
  getAllCarts,
  getSingleCartById,
};
