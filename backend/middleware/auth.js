const jwt = require("jsonwebtoken");
const customError = require("../utils/customError");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.token; // Standardize header key
    if (!authHeader) {
      return next(new customError("Authentication token missing", 401)); // Updated error message and status code
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer"
    if (!token) {
      return next(new customError("Authentication token not provided", 403));
    }

    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err.message);
        return next(new customError("Invalid or expired token", 403));
      }

      req.user = decoded; // Attach decoded token data (e.g., id, isAdmin) to `req.user`
      next();
    });
  } catch (error) {
    console.error("Token verification error:", error.message);
    next(new customError("Failed to verify token", 500));
  }
};

const verifyAdminToken = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new customError("Authentication failed", 401));
    }

    // Check if the user has admin privileges
    if (!req.user.isAdmin) {
      return next(new customError("Access denied. Admins only", 403));
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error.message);
    next(new customError("Failed to verify admin privileges", 500));
  }
};

module.exports = {
  verifyToken,
  verifyAdminToken,
};
