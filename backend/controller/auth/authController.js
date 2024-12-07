const user = require("../../models/schema/userSchema");
const joischema = require("../../models/joischema/validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const customError = require("../../utils/customError");

const createToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_TOKEN, {
    expiresIn: "7d",
  });
};

//create refresh token

const createRefreshToken = (id, isAdmin) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_REFRESH_TOKEN, {
    expiresIn: "14d",
  });
};

//registration

const userReg = async (req, res, next) => {
  //validate req data
  const { value, error } = joischema.joiUserSchema.validate(req.body);

  if (error) {
    return next(new customError(error.details[0].message, 400));
  }
  const { name, email, number, password, confirmedpassword } = value;

  //check if user already exist

  const existUser = await user.findOne({ email });

  if (existUser) {
    return next(new customError("user already exist", 400));
  }
  //check password match

  if (password !== confirmedpassword) {
    return next(new customError("passwords do not match", 400));
  }

  //hashed and salt password

  const salt = await bcrypt.genSalt(8);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new user({
    name,
    email,
    number,
    password: hashedPassword,
  });

  await newUser.save();
  res.status(200).json({
    status: "success",
    message: "user registered successfully",
  });
};

const userLogin = async (req, res, next) => {
  //validate req data
  const { value, error } = joischema.joiUserLogin.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }
  const { email, password } = value;

  //check if user exist

  const userData = await user.findOne({ email });

  if (!userData) {
    return next(new customError("user is not found", 404));
  }

  //check if user is blocked

  if (userData.isBlocked) {
    return next(new customError("user is blocked", 403));
  }

  //checkk if user is admin

  if (userData.isAdmin) {
    return next(
      new customError(
        "acces denied please use another email. this email is already taken",
        403
      )
    );
  }

  //check if password is correct

  const isMatch = await bcrypt.compare(password, userData.password);
  if (!isMatch) {
    return next(new customError("incorrect password", 401));
  }
  const token = createToken(userData._id, userData.isAdmin);
  const refreshToken = createRefreshToken(userData._id, userData.isAdmin);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 1000,
  });

  res.status(200).json({
    message: "user logged in successfully",
    isAdmin: userData.isAdmin,
    token,
  });
};

// admin login

const adminLogin = async (req, res, next) => {
  //validate req
  const { value, error } = joischema.joiUserLogin.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }

  const { email, password } = value;
  //check if admin exist

  const adminData = await user.findOne({ email, isAdmin: true });

  if (!adminData) {
    return next(new customError("admin is not found or unauthorized", 404));
  }

  const isMatch = await bcrypt.compare(password, adminData.password);

  if (!isMatch) {
    return next(customError("incorrect password", 401));
  }

  const token = createToken(adminData._id, adminData.isAdmin);
  const refreshToken = createRefreshToken(adminData._id, adminData.isAdmin);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    samesite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "admin is logged successfully",
    token,
  });
};

const userLogout = async (req, res, next) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    samesite: "none",
  });

  res.status(200).json({
    message: "successfully logged out",
  });
};

module.exports = { userReg, userLogin, adminLogin, userLogout };
