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
  const updateUser = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }
        // Check if the new username is already taken
        const existingUser = await User.findOne({ username: req.body.user });
        if (existingUser && existingUser._id.toString() !== req.params.id) {
            return res.status(400).json({ 'message': 'Username is already taken' });
        }
        const user = await User.findByIdAndUpdate({ _id: req.params.id }, {
            username: req.body.user,
            isSeller: req.body.isSeller,
        }, { new: true });
        if (!user) {
            return res.status(500).json({ 'message': 'User cannot be updated' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ 'message': error.message });
    }
};

const usersCount = async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.send({
            count: count
        });
    } catch (error) {
        console.error('Error counting users:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};
const changeUserRole = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isSeller) {
            user.roles = { Editor: 1320 };
            await user.save();
            res.status(200).json({ message: 'User roles updated successfully to Editor' });
        } else {
            res.status(400).json({ message: 'Role cannot be changed for this user' });
        }
    } catch (error) {
        console.error('Error updating user roles:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const changeEditorRole = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if(user.isSeller && user.roles.Editor){
            user.roles={User:2002};
            await user.save();
            res.status(200).json({ message: 'User roles updated successfully to User' });
        }else{
            res.status(400).json({ message: 'User is not an editor' });
        }
    } catch (error) {
        console.error('Error updating user roles:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.sendStatus(404).json({ 'message': 'User not found' });
        }
        const result = await user.remove();
        if (!result) {
            return res.status(500).json({ 'message': 'User cannot be deleted' });
        }
        res.json({ 'message': 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};

const getSellerUsers = async (req, res) => {
    try {
        const sellerUsers = await User.find({ isSeller: true }).select('-password');
        res.json(sellerUsers);
    } catch (error) {
        console.error('Error fetching seller users:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};

const UpdateDocument=async(req,res)=>{
    
}
module.exports={
    getAllUser,
    getUser,
    updateUser,
    usersCount,
    deleteUser,
    getSellerUsers,
    changeUserRole,
    changeEditorRole,
}