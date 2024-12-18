
const Order = require("../../models/schema/orderSchema");
const customError = require("../../utils/customError");

//1.get all orders

const getTotalOrders = async (req, res) => {
  const totalOrders = await Order.find()
    .populate("products.productId", "name price image")
    .sort({ createdAt: -1 });
  if (!totalOrders) return res.status(404).json({ message: "No orders found" });
  res.status(200).json({ data: totalOrders });
};

//2.get all order of a user

const getOrderByUser = async (req, res) => {
  const userOrders = await Order.find({ userId: req.params.id })
    .populate("products.productId", "name price image")
    .sort({ createdAt: -1 });
  if (!userOrders) return res.status(404).json({ message: "No orders found" });
  res.status(200).json({ data: userOrders });
};

//3.get the total no. of purches

const getTotalProductPurchased = async (req, res) => {
  const confirmedOrders = await Order.aggregate([
    { $match: { shippingStatus: { $ne: "cancelled" } } },
    { $count: "confirmedOrders" },
  ]);
  if (confirmedOrders.length === 0) {
    return res.status(404).json({ message: "No orders found" });
  }
  res.status(200).json({ data: confirmedOrders[0].confirmedOrders });
};

//4. updating the shipping status
const updateShippingStatus = async (req, res, next) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { shippingStatus: req.body.shippingStatus } },
    { new: true }
  );
  if (!order) {
    return next(new customError("order not found", 404));
  }
  res.status(200).json({ message: "order status updated successfully" });
};

//5. updating the payment status
const updatePaymentStatus = async (req, res, next) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id },
    { $set: { paymentStatus: req.body.paymentStatus } },
    { new: true }
  );
  if (!order) {
    return next(new customError("order not found", 404));
  }
  res
    .status(200)
    .json({ message: "order payment status updated successfully" });
};

//6.get the total revenue and total stats
const getTotalStats = async (req, res) => {
  const totalStats = await Order.aggregate([
    { $match: { shippingStatus: { $ne: "cancelled" } } },
    { $unwind: "$products" },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalSales: { $sum: 1 },
        totalProductsSold: { $sum: 1 },
      },
    },
  ]);

  if (totalStats.length === 0) {
    return res.status(404).json({ message: "No orders found" });
  }

  res.status(200).json({
    data: {
      totalRevenue: totalStats[0].totalRevenue,
      totalSales: totalStats[0].totalSales,
      totalProductsSold: totalStats[0].totalProductsSold,
    },
  });
};

module.exports = {
  getTotalOrders,
  getOrderByUser,
  getTotalProductPurchased,
  updateShippingStatus,
  updatePaymentStatus,
  getTotalStats,
};
