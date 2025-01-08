const { required, string, types } = require("joi");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    image: { type: String, required: true, trim: true },
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    brand:{type:String,required:true},
    qty: { type: Number, required: true, min: 1 },
    description: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("products", productSchema);
