const express = require("express");
const tryCatch = require("../utils/tryCatch.js");
const adminUserController = require("../controller/admin/adminUserController");
const adminCartController = require("../controller/admin/adminCartcontroller");
const adminProductController = require("../controller/admin/adminProductController");
const adminOrderController = require("../controller/admin/adminOrderController");
const upload = require("../middleware/multer");

const { verifyToken, verifyAdminToken } = require("../middleware/auth.js");
const routes = express.Router();

routes
  //admin user routes

  .get(
    "/users",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminUserController.getAllUsers)
  )

  .get(
    "/user/:id",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminUserController.getSingleUser)
  )

  .get(
    "/user-total",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminUserController.getTotalUsers)
  )

  .patch(
    "/user-block/:id",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminUserController.blockUser)
  )

  //just a func
  .delete(
    "/user-delete/:id",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminUserController.deleteUser)
  )

  //cart routes

  .get(
    "/cart",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminCartController.getAllCarts)
  )

  .get(
    "/cart/:id",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminCartController.getSingleCartById)
  )

  //product routes

  .get(
    "/products",
    verifyToken,
    verifyAdminToken,
    adminProductController.getAllProducts
  )

  .get(
    "/products/:id",
    verifyToken,
    verifyAdminToken,
    adminProductController.getSingleProduct
  )

  .get(
    "/products/category/:type",
    verifyToken,
    verifyAdminToken,
    adminProductController.getProductByCategory
  )

  .post(
    "/product/create",
    verifyToken,
    verifyAdminToken,
    upload.single("image"),
    tryCatch(adminProductController.createProduct)
  )

  .put(
    "/product/update/:id",
    verifyToken,
    verifyAdminToken,
    upload.single("image"),
    tryCatch(adminProductController.updateProduct)
  )

  .patch(
    "/product/bin/:id",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminProductController.deleteProduct)
  )

  .delete(
    "/product/delete/:id",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminProductController.deleteProductfromBin)
  )

  //order routes

  .get(
    "/order",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminOrderController.getTotalOrders)
  )

  .get(
    "/order/user/:id",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminOrderController.getOrderByUser)
  )

  .get(
    "/order/total",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminOrderController.getTotalProductPurchased)
  )

  .get(
    "/order/status",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminOrderController.getTotalStats)
  )

  .patch(
    "/order/shipping/:id",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminOrderController.updateShippingStatus)
  )

  .patch(
    "/order/payment/:id",
    verifyToken,
    verifyAdminToken,
    tryCatch(adminOrderController.updatePaymentStatus)
  );

module.exports = routes;
