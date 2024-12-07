const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    number: { type: Number, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
