const orderSchema = require("../../modles/schema/orderSchema");
const customError = require("../../utils/customError");
const cartSchema = require("../../modles/schema/cartSchema");
const Stripe = require("stripe");
const mongoose = require("mongoose");
const productSchema = require("../../modles/schema/productSchema");

// 1. Cash on Delivery

const orderCOD=async (req,res,next)=>{

    const newOrder=await new orderSchema({
        ...req.body,
        userId:req.user.id
    }).populate("products.productId","name price image");

    if(!newOrder){
        return next(new customError("Order not created",400));
    }
    const unavailableProduct=await productSchema.find({
        _id:{$in:newOrder.products.map((product)=>product.productId)},
        isDeleted:true,
    });

    if(!unavailableProduct){
        return next(new customError("Product not available",404));
    }

    //getting the status for payment n delivery

    newOrder.paymentStatus ="cash on delivery";
    newOrder.shippingStatus="processing";

    let currentUserCart = await cartSchema.findOneANdUpdate(
        {userId:req.user.id},
        {$set:{products:[]}},
        {new:true}
    );

    if(currentUserCart){

        await currentUserCart.save();
    }

    await newOrder.save();
    res.status(201).json({message:"Order placed successfully"});

};

//2. payment gateway (make order with stripe)
const orderWithStripe = async (req, res, next) => {
    const { products, address, totalAmount } = req.body;
    if (!products || products.length === 0) {
      return next(new customError("no product find", 400));
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
      success_url: `http://localhost:3000/success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel`,
    });
    const newOrder = new orderSchema({
      userId: req.user.id,
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
      res.status(200).json({
        data: { order: newOrder },
      });
    } else {
      res.status(200).json({
        data: { order: [] },
      });
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
    const cancelOrder = await orderSchema.findOneAndUpdate(
      {
        _id: req.params.orderId,
        userId: req.user.id,
      },
      { $set: { shippingStatus: "cancelled" } },
      { new: true }
    );
    if (!cancelOrder) {
      return next(new customError("Order not found", 404));
    }
    if (cancelOrder.paymentStatus === "paid") {
      return next(new customError("Order already paid", 400));
    }
    cancelOrder.shippingStatus = "cancelled";
    cancelOrder.paymentStatus = "cancelled";
    res.status(200).json({ message: "Order cancelled successfully" });
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
  