const { default: mongoose } = require('mongoose');
const User=require('../model/User');

const getAllUser=async (req,res)=>{
  const userList=await User.find().select('-password').exec();  
  if(!userList) return res.sendStatus(204).json({'message':'No users found'});
   res.json(userList);
}
const getUser=async (req,res)=>{
    if(!req?.params?.id||!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json({'message':`Correct ID parameter is required`});
    }
    const user=await User.findById({_id:req.params.id}).select('-password').exec();  
    if(!user) return res.sendStatus(204).json({'message':'No user found'});
     res.json(user);
  }
const updateUser=async(req,res)=>{
    if(!req?.params?.id||!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json({'message':`Correct ID parameter is required`});
    }
    const user=await User.findByIdAndUpdate({_id:req.params.id},{
        name: req.body.name,
        discription: req.body.discription,
        address: req.body.address,
        image: req.body.image,
        price: req.body.price,
        category: req.body.category
    },
    {new:true}
    )
    const result=await user.save()
    if (!result) return res.status(500).json({ 'message': 'User cannot be updated' });
    res.json(result);
}
  const usersCount=async(req,res)=>{
    const usersCount=await User.countDocuments((count)=>count);

    if(!usersCount){
        res.status(500).json({'message':'Server error'});
    }
    res.send({
        count:usersCount
    })
}
module.exports={
    getAllUser,
    getUser,
    updateUser,
    usersCount
}