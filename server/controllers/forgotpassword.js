const User=require('../model/User');
const nodemailer=require('nodemailer');
const randomstring=require("randomstring");
const forgotPassword=async(req,res)=>{
    try{
    const userData=await User.findOne({email:req.body.email});
    if(userData){

    }else{
        res.status(200).send({success:true,msg:"this email does not exist"});
    }
    }catch(err){
        res.status(400).send({success:false,msg:err.message});
    }
}