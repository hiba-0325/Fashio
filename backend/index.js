const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const manageError = require("./middleware/manageError");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("../backend/routes/authRoutes");
const adminRoutes= require("../backend/routes/adminRoutes")
const connectCloudinary=require("./config/cloudinary")
const app = express();
dotenv.config();
//connect to cloudin

connectCloudinary();
//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/admin",adminRoutes);
//catch unhandled routes

app.all("*", (req, res) => {
  res.status(404).json({
    statuse: "fail",
    message: "cannot access this end point",
  });
});

//db connection
mongoose
  .connect(process.env.MONGOOSE_URL)
  .then(() => console.log("connected to mongoose"))
  .catch((err) => console.error(err));
app.use(manageError);
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`server running on port ${PORT} `));
     