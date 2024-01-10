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
        validate(value){
            if(!value.match(/\d/)||!value.match(
                /[a-zA-Z]/)){
                    throw new Error("password must contian atleast one letter and one number");
                }
                else if(value.length<6){
                    throw new Error("Minimum length is 6 charecter");
                }
        },
        required:true,
    },
    isSeller:{
        type:Boolean,
        default:false
    },
    idProof:{
        type:String,
        default:undefined,
    },
    documentProof:{
        type:String,
        default:undefined,
    },
    refreshToken:[String],
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
// userScehma.virtual('id').get(function(){
//     return this._id.toHexString();
// })
userScehma.set('toJSON',{virtuals:true})
module.exports=mongoose.model('User',userScehma);