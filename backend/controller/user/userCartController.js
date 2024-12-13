const cartSchema = require("../../models/schema/cartSchema");
const customError = require("../../utils/customError");

//show cart for specific users

const getUserCart = async (req, res) => {
  const data = await cartSchema.findOne({ userId: req.user.id }).populate({
    path: "products.productId",
    select: "name price image",
  });

  if (data) {
    res.status(200).json({
      status: "success",
      data,
    });
  } else {
    res.status(200).json({
      status: "success",
      data: {
        products: [],
      },
    });
  }
};

//add product to cart or upd qty

const updateUserCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    next(new customError(`invalid quantity${quantity}`, 400));
  }
  let cart = await cartSchema.findOne({ userId: req.user.id });

  if (!cart) {
    cart = await cartSchema.create({
      userId: req.user.id,
      products: [{ productId, quantity }],
    });
  } else {
    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId.toString()
    );

    if (productIndex > -1) {
      //if product already exists in cart, update qty
      cart.products[productIndex].quantity += quantity;
    } else {
      //if product does not exist in cart, add new product
      cart.products.push({ productId, quantity });
    }
  }
  const cartSaved = await cart.save();
  await cartSaved.populate({
    path: "products.productId",
    select: "name price image",
  });
  res.status(200).json({ message: "product added to cart" });
};

//remove product from cart

const removeFromCart = async (req, res) => {
  //findingcart by user id

  const cart = await cartSchema.findOneAndUpdate(
    { userId: req.user.id, "products.productId": req.body.productId },

    { $pull: { products: { productId: req.body.productId } } },
    { new: true }
  );
  if (cart) {
    res.status(200).json({ message: "product removed from cart" });
  } else {
    res.status(404).json({ message: "product not found in cart" });
  }
};

module.exports = { getUserCart, updateUserCart, removeFromCart };
