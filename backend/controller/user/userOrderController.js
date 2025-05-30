const orderSchema = require("../../models/schema/orderSchema");
const customError = require("../../utils/customError");
const cartSchema = require("../../models/schema/cartSchema");
const Stripe = require("stripe");
const mongoose = require("mongoose");
const productSchema = require("../../models/schema/productSchema");

// 1. Cash on Delivery

const orderCOD = async (req, res, next) => {
  const newOrder = await new orderSchema({
    ...req.body,
    userId: req.user.id,
  }).populate("products.productId", "name price image");

  if (!newOrder) {
    return next(new customError("Order not created", 400));
  }
  const unavailableProduct = await productSchema.find({
    _id: { $in: newOrder.products.map((product) => product.productId) },
    isDeleted: true,
  });

  if (!unavailableProduct) {
    return next(new customError("Product not available", 404));
  }

  //getting the status for payment n delivery

  newOrder.paymentStatus = "Cash on delivery";
  newOrder.shippingStatus = "processing";

  let currentUserCart = await cartSchema.findOneAndUpdate(
    { userId: req.user.id },
    { $set: { products: [] } },
    { new: true }
  );

  if (currentUserCart) {
    await currentUserCart.save();
  }

  await newOrder.save();
  res.status(201).json({ message: "Order placed successfully" });
};

//2. payment gateway (make order with stripe)
const orderWithStripe = async (req, res, next) => {
  const { products, address, totalAmount, firstName, lastName, email, mobile } =
    req.body;
  if (
    !products ||
    !address ||
    !totalAmount ||
    !firstName ||
    !lastName ||
    !email ||
    !mobile
  ) {
    return next(new customError("all field required", 400));
  }
  const productDetails = await Promise.all(
    products.map(async (item) => {
      const product = await productSchema.findById(item.productId);
      if (!product) {
        return next(new customError("Product not found", 404));
      }
      return {
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity,
      };
    })
  );
  const newTotal = Math.round(totalAmount);
  // creating the stripe line items
  const lineItem = productDetails.map((item) => ({
    price_data: {
      currency: "inr",
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  // creating the stripe session
  const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItem,
    mode: "payment",
    success_url: `http://localhost:5173/success/{CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:5173/cancel`,
  });
  const newOrder = new orderSchema({
    userId: req.user.id,
    firstName,
    lastName,
    email,
    mobile,
    products,
    address,
    totalAmount: newTotal,
    paymentStatus: "pending",
    shippingStatus: "processing",
    paymentMethod: "stripe",
    sessionId: session.id,
  });
  await newOrder.save();

  res.status(200).json({
    message: "Order placed successfully",
    sessionId: session.id,
    stripeUrl: session.url,
  });
};
// 3. success stripe payment
const stripeSuccess = async (req, res, next) => {
  const sessionId = req.params.sessionId;
  //finding the order using session id
  const order = await orderSchema.findOne({ sessionId: sessionId });
  if (!order) return next(new customError("Order not found", 404));
  order.paymentStatus = "paid";
  order.shippingStatus = "processing";
  await order.save();

  await cartSchema.findOneAndUpdate(
    { userId: order.userId },
    { $set: { products: [] } }
  );
  res.status(200).json({ message: "payment successful!" });
};

// Get All Orders for a User
const getAllOrders = async (req, res) => {
  const newOrder = await orderSchema
    .find({ userId: req.user.id })
    .populate("products.productId", "name price image")
    .sort({ createdAt: -1 });
  if (newOrder) {
    res.status(200).json({ data: newOrder });
  } else {
    res.status(200).json({ data: [] });
  }
};

// Get a Specific Order by ID
const getOneOrder = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.orderId)) {
    return next(new customError("Invalid order ID", 400));
  }
  const singleOrder = await orderSchema
    .findOne({
      _id: req.params.orderId,
      userId: req.user.id,
    })
    .populate("products.productId", "name price image");
  if (!singleOrder) {
    return next(new customError("Order not found", 404));
  }
  res.status(200).json({ singleOrder });
};

// Cancel an Order by ID

const cancelOneOrder = async (req, res, next) => {
  try {
    const order = await orderSchema.findOne({
      _id: req.params.orderId,
      userId: req.user.id,
    });

    if (!order) {
      return next(new customError("Order not found", 404));
    }

    // will get an error on cancellation if the order is already paid
    if (order.paymentStatus === "paid") {
      return next(
        new customError("Order cannot be canceled as it is already paid.", 400)
      );
    }
    if (order.shippingStatus === "cancelled") {
      return next(new customError("Order is already canceled.", 400));
    }
    // will update order shipping status to "Cancelled"
    order.shippingStatus = "cancelled";
    order.paymentStatus = "cancelled";
    await order.save();
    await order.populate("products.productId", "name price image");

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const publicKeySend = async (req, res) => {
  res.status(200).json({ stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
};

module.exports = {
  orderCOD,
  getAllOrders,
  getOneOrder,
  cancelOneOrder,
  orderWithStripe,
  stripeSuccess,
  publicKeySend, // public key send to frontend
};
