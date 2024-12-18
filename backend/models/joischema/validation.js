const joi = require("joi");

const joiUserSchema = joi.object({
  name: joi.string(),
  number: joi.number().min(10).required(),
  email: joi.string().email().required(),
  password: joi
    .string()
    .pattern(/^(?=.*\d)(?=.*[A-Z])[A-Za-z\d]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must have at least one capital letter, one number and must be at least 8 charecters long.",
    }),
  confirmedpassword: joi
    .string()
    .valid(joi.ref("password"))
    .required()
    .messages({
      "any.only": "Confirmed password must match password.",
    }),
});

const joiUserLogin = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

const joiproductSchema = joi.object({
  name: joi.string().required(),
  type: joi.string().required(),
  price: joi.number().required(),
  qty: joi.number().required(),
  description: joi.string().required(),
  rating: joi.number().min(1).max(5),
  reviews: joi.number().optional(),
  isDeleted: joi.boolean().default(false).optional(),
});

module.exports = { joiUserSchema, joiUserLogin, joiproductSchema };
