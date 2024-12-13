const wishlistSchema = require("../../models/schema/wishlistSchema");

const customError = require("../../utils/customError");

//1.to get user wishlist
const getUserWishlist = async (req, res) => {
  //find user wishlist and populate with products
  const data = await wishlistSchema
    .findOne({ userId: req.user.id })
    .populate("products");
  if (data) {
    return res.status(200).json({
      status: "success",
      data: data,
    });
  } /*else{
    throw new customError("no wishlist found", 404);
  }*/ else {
    res.status(200).json({ products: [] });
  }
};

//2.to add product to user wishlist

const addToWishlist = async (req, res, next) => {
  const { productId } = req.body;

  if (!productId) {
    return next(new customError("Product ID is required", 400));
  }

  try {
    let wishlist = await wishlistSchema.findOne({ userId: req.user.id });

    if (!wishlist) {
      wishlist = new wishlistSchema({
        userId: req.user.id,
        products: [productId],
      });
    } else if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
    }

    await wishlist.save();

    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    next(new customError("Failed to add product to wishlist", 500));
  }
};

//3.to remove product from user wishlist

const removeFromWishlist = async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) {
    return next(new customError("Product is required", 400));
  }
  const newWishlist = await wishlistSchema.findOneAndUpdate(
    { userId: req.user.id },
    { $pull: { products: productId } },
    { new: true }
  );
  if (newWishlist) {
    res.status(201).json({ message: "product removed from wishlist" });
  } else {
    next(new customError("product not found in wishlist", 404));
  }
};

module.exports = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
};
