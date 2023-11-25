const mongoose=require('mongoose');
const crypto=require('crypto');
const Schema=mongoose.Schema;
const userScehma=new Schema({
    username:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    roles:{
        User:{
            type:Number,
            default:2002
        },
        Editor:Number,
        Admin:Number,
    },
    password:{
        type:String,
        required:true,
    },
    refreshToken:String,
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date,
})
userScehma.methods.createResetPassword=function(){
    const resetToken=crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires=Date.now()+10*60*1000;
    console.log(resetToken,this.passwordResetToken);
    return resetToken;


}
module.exports=mongoose.model('User',userScehma);