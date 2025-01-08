const User = require("../../models/schema/userSchema");
const customError = require("../../utils/customError");
//Get all users
const getAllUsers = async (req, res, next) => {
  const users = await User.find({ isAdmin: false }).select("-password");
  res.status(200).json({ users });
};

//get single user by id
const getSingleUser = async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return next(new customError("user not found", 404));
  }
  res.status(200).json({ user });
};
//get total number of users
const getTotalUsers = async (req, res, next) => {
  const totalUsers = await User.countDocuments({ isAdmin: false });
  res.status(200).json({ totalUsers });
  if (!totalUsers) {
    return next(new customError("no users found", 404));
  }
};
//block user
const blockUser = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new customError("user not found", 404));
  }
  user.isBlocked = true;
  await user.save();
  res
    .status(200)
    .json({ message: user.isBlocked ? "user blocked" : "user unblocked" });
};

//unblock
const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new customError("User not found", 404));
    }

    if (!user.isBlocked) {
      return res.status(400).json({ message: "User is already unblocked" });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({ message: "User successfully unblocked" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getSingleUser,
  getTotalUsers,
  blockUser,
  unblockUser,
};
