const joi = require('joi');

const joiUserSchema = joi.object({

    name:joi.string(),
    number:joi.number().min(10).required(),
    email:joi.string().email().required(),
    password: joi.string()
    .pattern(/^(?=.*\d)(?=.*[A-Z])[A-Za-z\d]{8,}$/)
    .required()
    .message({
        "string.pattern.base":"Password must have at least one capital letter, one number and must be at least 8 charecters long.",
    }),
    confirmedpassword:joi.string().valid(joi.ref("password")).required()
.message({

    "any.only":"Confirm password must match password.",
}),

});

const joiUserLogin=joi.object({
    name:joi.string().email().required(),
    password:joi.string().required(),
  
})

// const joiproductSchema=joi.object({
//     name:joi.string().required(),
//     type:joi.string()
// })