const product = require("../../models/schema/productSchema");

const gotAllProduct = async (req, res) => {
  const allProduct = await product.find();

  res.status(200).json({
    status: "success",
    message: "all products fetched successfully",
    data: allProduct,
  });


  const getProductType= async (req,res)=>{
    const type= req.params.type;
    const productType= await product.find({type:type});
    res.status(200).json({
        status:"success",
        message:"product is fetched by type successfully",
        data:productType,

    });

  };


  const getProductById= async (req,res)=>{
    const _id= req.params.id;
    const priductId= await product.findById(_id);
    res.status(200).json({
        status:"success",
        message:" Product get by id successfully",
    })
  }
};
