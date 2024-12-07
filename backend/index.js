const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const authRoutes = require("../backend/routes/authRoutes");
const manageError = require("./middleware/manageError");
const app = express();
dotenv.config();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//routes
// app.use("/user", userRoute);
app.use("/auth", authRoutes);

//catch unhandled routes

app.all("*", (req, res) => {
  res.status(404).json({
    statuse: "fail",
    message: "cannot access this end point",
  });
});

mongoose
  .connect(process.env.MONGOOSE_URL)
  .then(() => console.log("connected to mongoose"))
  .catch((err) => console.error(err));
app.use(manageError);
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`server running on port ${PORT} `));
