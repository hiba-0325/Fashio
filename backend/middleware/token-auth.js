const jwt = require("jsonwebtoken");
const customError = require("../utils/customError");
const { custom } = require("joi");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.token; //standarize hheader key

    if (!authHeader) {
      return next(new customError("Authentication token missing", 401));
    }
    const token = authHeader.split("")[1]; //extract token from "bearer"
    if (!token) {
      return next(new customError("Authentication token not provided", 403));
    }
    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err.message);
        return next(new customError("Invalide or expired token", 403));
      }

      req.user = decoded; //attach decoded data eg: id ,isAdmin
      next();
    });
  } catch (error) {
    console.error("token veerification error", error.message);
    next(new customError("failed to verify ttoken", 500));
  }
};
const verifyAdminToken = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new customError("Authentication failed", 401));
    }

    next();
  } catch (error) {
    console.error("admin verification error:", error.message);
    next(new customError("ailed to verify admin privilages"));
  }
};

module.exports = { verifyToken, verifyAdminToken };
