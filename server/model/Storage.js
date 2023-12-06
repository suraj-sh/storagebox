var mongoose=require('mongoose');
const Schema=mongoose.Schema;
const storageSchema=new Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    address:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        default:'',
    },
    images:[{
        type:String
    }],
    price:{
        type:Number,
        default:0,
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
storageSchema.set('toJSON',{
    virtuals:true,
})

module.exports=mongoose.model('Storage',storageSchema);