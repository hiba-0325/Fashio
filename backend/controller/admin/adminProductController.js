const product = require("../../modles/schema/productSchema");
const customError = require("../../utils/customError");
const joischema = require("../../modles/joischema/validation");

// create product
const createProduct = async (req, res, next) => {
  const { value, error } = joischema.joiProductSchema.validate(req.body);
  if (error) {
    return next(new customError(error.details[0].message, 400));
  }
  if (!req.file || !req.file.path) {
    return next(new customError("Image not found", 400));
  }
  const newProduct = new product({
    ...value,
    image: req.file.path,
  });
  if (!newProduct) {
    return next(new customError("Product not created", 500));
  }
  await newProduct.save();
  res.status(201).json({
    message: "product created successfully",
  });
};
