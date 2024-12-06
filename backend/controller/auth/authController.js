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

const useReg = async (req, res, next) => {
  //validate req data
  const { value, error } = joischema.joiUserSchema.validate(req.body);

  if (error) {
    return next(new customError(error.details[0].message, 400));
  }
  const { name, email, number, password, confirmpassword } = value;

  //check if user already exist

  const existUser = await user.findOne({ email });

  if (existUser) {
    return next(new customError("user already exist", 400));
  }
  //check password match

  if (password !== confirmpassword) {
    return next(new customError("passwords do not match", 400));
  }

  //hashed and salt password

  const salt=await bcrypt.genSalt(8);
  const hashedPassword=await bcrypt.hash(password,salt);
  const newUSer= new user({
    name,
    email,
    number,
    password:hashedPassword,
  });

  await newUSer.save();


  res.status(200).json({
    status:"success",
    message:"user registered successfully",
  });
};

const userLogin= async (req,res,next )=>{
    //validate req data
    const {value,error}=joischema.joiUserLogin.validate(req.body);

    if(error){
        return res.status(400).json({
            status:"error",
            message:error.details[0].message,
        });
    }
    const {email,password}=value;

    //check if user exist

    const userData= await user.findOne({email});

    if(!userData){
        return  next (new customError("user is not found",404));

    }

    //check if user is blocked

    if(userData.isBlocked){
        return next(new customError("user is blocked",403));
    }

    //checkk if user is admin

    if(userData.isAdmin){
        return next(new customError("acces denied please use another email. this email is already taken",403));
    }

    //check if password is correct

    const isMatch= await bcrypt.compare(password,userData.password);
    if(!isMatch){
        return next(new customError("incorrect password",401));
    }
    const token = createToken(userData._id,userData.isAdmin);
    const refreshToken=createRefreshToken(userData._id,userData.isAdmin);

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"lax",
        maxAge:7 * 24 * 60 * 1000,
    });

    res.status(200).json({
        message:"user logged in successfully",
        isAdmin:userData.isAdmin,
        token,
    });

};
