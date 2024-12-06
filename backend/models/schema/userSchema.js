const { required, string, boolean } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: string, required: true, trim: true },
    email: { type: string, required: true, unique: true, trim: true },
    number: { type: number, required: true, unique: true, trim: true },
    password: { type: string, required: true, trim: true },
    isAdmin: { type: boolean, default: false },
    isBlocked: { type: boolean, default: false },
    refreshToken: { type: string },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
