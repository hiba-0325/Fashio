const user = require("../../models/schema/userSchema");
const joischema = require("../../models/joischema/validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const customError = require("../../utils/customError");
const userSchema = require("../../models/schema/userSchema");

const createToken = (id, isAdmin, expiresIn) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_TOKEN, {
    expiresIn,
  });
};

//create refresh token

const createRefreshToken = (id, isAdmin, expiresIn) => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_REFRESH_TOKEN, {
    expiresIn,
  });
};

//registration

const userReg = async (req, res, next) => {
  //validate req data
  const { value, error } = joischema.joiUserSchema.validate(req.body);

  if (error) {
    return next(new customError(error.details[0].message, 400));
  }
  const { name, email, number, password } = value;

  //check if user already exist

  const existUser = await user.findOne({ email });

  if (existUser) {
    return next(new customError("user already exist", 400));
  }
  //check password match

  // if (password !== confirmedpassword) {
  //   return next(new customError("passwords do not match", 400));
  // }

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
  const token = createToken(userData._id, userData.isAdmin, "1h");
  const refreshToken = createRefreshToken(userData._id, userData.isAdmin, "1d");
  userData.refreshToken = refreshToken;
  await userData.save();

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 1000,
  });

  const currentUser = {
    id: userData._id,
    name: userData.name,
    email: userData.email,
    isAdmin: userData.isAdmin,
  };

  res.cookie("currentUser", JSON.stringify(currentUser));

  res.cookie("token", token, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
  });
  // res.status(200).json({
  //   message: "user logged in successfully",
  //   isAdmin: userData.isAdmin,
  //   token,
  // });
  res.json({ message: "user logged in successfully", token });
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

  const token = createToken(adminData._id, adminData.isAdmin, "1h");
  const refreshToken = createRefreshToken(
    adminData._id,
    adminData.isAdmin,
    "1d"
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    samesite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const currentUser = {
    id: adminData._id,
    name: adminData.name,
    email: adminData.email,
    isAdmin: adminData.isAdmin,
  };
  //sending user details to client (for curr user)
  res.cookie("currentUser", JSON.stringify(currentUser));

  //sending token to cookie
  res.cookie("token", token, {
    httpOnly: false,
    secure: true,
    sameSite: "none",
  });

  res.json({ message: "Admin successfully logged in", token });
};

const refreshingToken = async (req, res, next) => {
  console.log(req.cookies);
  if (!req.cookies) {
    return next(new customError("No cookies found", 401));
  }
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new customError("No refresh token found", 401));
  }

  // Verifying the refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);

  const user = await userSchema.findById(decoded.id);
  console.log(user)
  if (!user || user.refreshToken !== refreshToken) {
    return next(new customError("Invalid refresh token", 401));
  }
  let accessToken = createToken(user._id, user.role, "1h");

  res.status(200).json({ message: "Token refreshed", token: accessToken });
};

const userLogout = async (req, res, next) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    samesite: "none",
  });
  res.clearCookie("token", {
    httpOnly: false,
    secure: true,
    sameSite: "none",
  });
  res.clearCookie("currentUser", {
    httpOnly: false,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({
    message: "successfully logged out",
  });
};

module.exports = {
  userReg,
  userLogin,
  adminLogin,
  userLogout,
  refreshingToken,
};
