var mongoose=require('mongoose');
const Schema=mongoose.Schema;
const storageSchema=new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    mobileNo:{
        type:Number,
        required:true,
    },
    images:[{
        type:String
    }],
    price:{
        type:Number,
        default:0,
    },
    isRented:{
        type:Boolean,
        default:false,
    },
    category:{
        type:String,
        required:true,
    },
    dateCreated:{
       type:Date,
       default:Date.now, 
    }
})
storageSchema.virtual('id').get(function(){
    return this._id.toHexString();
})
storageSchema.set('toJSON', { virtuals: true });

module.exports=mongoose.model('Storage',storageSchema);