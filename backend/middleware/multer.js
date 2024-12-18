const cloudinary=require("cloudinary").v2;
const {CloudinaryStorage}=  require("multer-storage-cloudinary");
const multer=require("multer");

//cloudinary storage for multer

const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"trendway",
        allowedFormats:["jpeg","png","jpg"],
    },
});

//multer for uplodadinh img to cloudinary

const upload = multer({storage});

module.exports=upload;