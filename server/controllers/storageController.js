const { default: mongoose } = require('mongoose');
const Storage = require('../model/Storage');

const getAllStorage = async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    const storageList = await Storage.find(filter).exec();

    if (!storageList || storageList.length === 0) {
        return res.status(204).json({ 'message': 'No Storages found' });
    }

    res.json(storageList);
}

 const getStorage = async (req, res) => {
    if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ 'message': 'Correct ID parameter is required' });
    }
    try {
        const storage = await Storage.findById({ _id: req.params.id }).exec();
        if (!storage) {
            return res.status(204).json({ 'message': 'No Storage found' });
        }
        res.status(200).json(storage);
    } catch (error) {
        console.error('Error retrieving storage:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
}

const createNewStorage = async (req, res) => {
    if (!req?.body?.name || !req?.body?.description || !req?.body?.address || !req?.body?.category) {
        return res.status(400).json({ 'message': 'name, description, address, and category name required' });
    }
    try {
        const storage = await Storage.create({
            name: req.body.name,
            description: req.body.description, 
            address: req.body.address,
            image: req.body.image,
            price: req.body.price,
            category: req.body.category
        });        
        if (!storage) return res.status(500).json({ 'message': 'Storage cannot be created' });
        res.status(201).json(storage);
    } catch (err) {
        console.log(err);
        res.status(500).json({ 'message': 'Internal Server Error' }); 
    }
};

const updateStorage=async(req,res)=>{
    if(!req?.params?.id||!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json({'message':`Correct ID parameter is required`});
    }
    const storage=await Storage.findByIdAndUpdate({_id:req.params.id},{
        name: req.body.name,
        discription: req.body.discription,
        address: req.body.address,
        image: req.body.image,
        price: req.body.price,
        category: req.body.category
    },
    {new:true}
    )
    const result=await storage.save()
    if (!result) return res.status(500).json({ 'message': 'Storage cannot be created' });
    res.json(result);
}
const deleteStorage= async (req,res)=>{
    if(!req?.params?.id||!mongoose.isValidObjectId(req.params.id)){
        res.status(400).json({'message':`Correct ID is required`});
        }
    const storage=await Storage.findByIdAndDelete({_id:req.params.id}).exec();
    if(!storage){
        res.sendStatus(204).json({'message':`No employee matches ID ${req.body.id}`});
    }
    const result=await storage.deleteOne({_id:req.body.id});
    res.json(result);
}
const storageCount=async(req,res)=>{
    const storageCount=await Storage.countDocuments((count)=>count);

    if(!storageCount){
        res.status(500).json({'message':'Server error'});
    }
    res.send({
        count:storageCount
    })
}
module.exports = {
    getAllStorage,
    createNewStorage,
    getStorage,
    updateStorage,
    deleteStorage,
    storageCount
}