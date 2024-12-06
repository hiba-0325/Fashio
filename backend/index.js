const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
dotenv.config();
mongoose
  .connect(process.env.MONGOOSE_URL)
  .then(() => console.log("connected to mongoose"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`server running on port ${PORT} `));
