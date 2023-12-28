const { default: mongoose } = require('mongoose');
const Storage = require('../model/Storage');

const getAllStorage = async (req, res) => {
    try {
        let filter = {};
        if (req.query.categories) {
            filter = { category: req.query.categories.split(',') };
        }
        if(req.query.cities){
            filter = { city: req.query.cities.split(',') };
        }
        const storageList = await Storage.find(filter).populate('user' ,'username ').exec();
        if (!storageList || storageList.length === 0) {
            return res.status(204).json({ 'message': 'No Storages found' });
        }
        
        res.json(storageList);
    } catch (error) {
        res.status(500).json({ 'message': error.message });
    }
};


const getStorageOfUser = async (req, res) => {
    try {
        const userStorage = await Storage.find({ user:req.userId});
        if (!userStorage || userStorage.length === 0) {
            return res.status(204).json({ 'message': 'No Storages found' });
        }   
        if (userStorage[0].user.toString() !== req.userId) {
            return res.status(401).send("Not Allowed");
        }
        res.json(userStorage)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
}

 const getStorage = async (req, res) => {
    if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ 'message': 'Correct ID parameter is required' });
    }
    try {
        const storage = await Storage.findById({ _id: req.params.id }).populate('user', 'username').exec();
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
    if (!req?.body?.name || !req?.body?.description || !req?.body?.city || !req?.body?.category) {
        return res.status(400).json({ 'message': 'name, description, address, and category name required' });
    }
    if (!req.file) {
        return res.status(400).json({ 'message': 'Image file is required' });
      }
    
    const fileName=req.file.filename
    const basePath=`${req.protocol}://${req.get('host')}/public/upload/`
    try {
        const storage = await Storage.create({
            user: req.userId, 
            name: req.body.name,
            description: req.body.description, 
            city: req.body.city,
            image: `${basePath}${fileName}`,
            price: req.body.price,
            category: req.body.category,
            mobileNo:req.body.mobileNo,
        });        
        if (!storage) return res.status(500).json({ 'message': 'Storage cannot be created' });
        res.status(201).json(storage);
    } catch (err) {
        console.log(err);
        res.status(500).json({ 'message': 'Internal Server Error' }); 
    }
};
const updateMultipleImage=async(req,res)=>{
    if (!req?.body?.name || !req?.body?.description || !req?.body?.address || !req?.body?.category) {
        return res.status(400).json({ 'message': 'name, description, address, and category name required' });
    }
    const files=req.files;
    let imagePaths=[];
    const  basePath=`${req.protocol}://${req.get('host')}/public/upload/`;
    if(files){
        files.map((file)=>{
            imagePaths.push(`${basePath}${file.filename}`);
        })
    }
    try{
    const storage=await Storage.findByIdAndUpdate({_id:req.params.id},
        {
            images:imagePaths
        },
        {new:true}
    )
    if (!storage) return res.status(500).json({ 'message': 'Image cannot be uploaded' });
    res.status(201).json(storage);
    } catch (err) {
    console.log(err);
    res.status(500).json({ 'message': 'Internal Server Error' }); 
}
}
const deleteImageFromStorage = async (req, res) => {
    try {
        const storage = await Storage.findById(req.params.id);
        if (!storage) {
            return res.status(404).json({ 'message': 'Storage not found' });
        }
        if (storage.user.toString() !== req.userId) {
            return res.status(401).send("Not Allowed");
        }
        const imageIndex = storage.images.findIndex(image => image.endsWith(req.params.imageName));

        if (imageIndex === -1) {
            return res.status(404).json({ 'message': 'Image not found in the storage' });
        }
        // Remove the image path from the images array
        storage.images.splice(imageIndex, 1);
        const updatedStorage = await storage.save();
        res.json(updatedStorage);
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};


const updateStorage = async (req, res) => {
    try {
        if (!req.params.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': 'Correct ID parameter is required' });
        }
        const storage = await Storage.findById(req.params.id);
        if (!storage) {
            return res.status(404).json({ 'message': 'Storage not found' });
        }
        // Check if the user is allowed to update this storage
        if (storage.user.toString() !== req.userId) {
            return res.status(401).send("Not Allowed");
        }
        if (!req.body.name && !req.body.description && !req.body.address && !req.body.price && !req.body.category && !req.file) {
            return res.status(400).json({ 'message': 'At least one field or file should be provided for update' });
        }

        let updateFields = {
            name: req.body.name,
            description: req.body.description,
            city: req.body.city,
            price: req.body.price,
            category: req.body.category,
            mobileNo:req.body.mobileNo,
            isRented: req.body.isRented
        };

        // Check if a file is uploaded
        if (req.file) {
            const fileName = req.file.filename;
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
            updateFields.image = `${basePath}${fileName}`;
        }
        const updatedStorage = await Storage.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );
        if (!updatedStorage) {
            return res.status(500).json({ 'message': 'Storage cannot be updated' });
        }
        res.json(updatedStorage);
    } catch (error) {
        console.error('Error updating storage:', error);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
};

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
    storageCount,
    updateMultipleImage,
    getStorageOfUser,
    deleteImageFromStorage
}