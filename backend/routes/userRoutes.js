const express = require("express");
const tryCatch = require("../utils/tryCatch");
const userProductController = require("../controller/user/userProductController");
const userCartController = require("../controller/user/userCartController");
const userWishlist = require("../controller/user/userWishlist");
const userOrderController = require("../controller/user/userOrderController");
const { verifyToken } = require("../middleware/auth");
const routes = express.Router();

routes
  //user product controller

  .get("/product", tryCatch(userProductController.getAllProduct))
  .get("/product/:id", tryCatch(userProductController.getProductById))
  .get("/product/:type", tryCatch(userProductController.getProductType))

  //cart ccontroller

  .get("/cart", verifyToken, tryCatch(userCartController.getUserCart))
  .post("/cart", verifyToken, tryCatch(userCartController.updateUserCart))
  .delete("/cart", verifyToken, tryCatch(userCartController.removeFromCart))

  //wishlist controller
  .get("/wishlist", verifyToken, tryCatch(userWishlist.getUserWishlist))
  .post("/wishlist", verifyToken, tryCatch(userWishlist.addToWishlist))
  .delete("/wishlist", verifyToken, tryCatch(userWishlist.removeFromWishlist))

  //orderController

  .get("/order", verifyToken, tryCatch(userOrderController.getAllOrders))
  .get(
    "/order/:orderId",
    verifyToken,
    tryCatch(userOrderController.getOneOrder)
  )
  .post("/order/cod", verifyToken, tryCatch(userOrderController.orderCOD))

  .post(
    "/order/stripe/checkout",
    verifyToken,
    tryCatch(userOrderController.orderWithStripe)
  )
  .patch(
    "/order/stripe/success/:sessionId",
    verifyToken,
    tryCatch(userOrderController.stripeSuccess)
  );

module.exports = routes;
