const { default: mongoose } = require('mongoose');
const Storage = require('../model/Storage');
const path=require('path');
const fs=require('fs');

const getAllStorage = async (req, res) => {
    try {
        let filter = {};
        if (req.query.categories) {
            filter.category = { $in: req.query.categories.split(',') };
        }
        if (req.query.cities) {
            filter.city = { $in: req.query.cities.split(',') };
        }
        filter.isRented = false;
        const sortOptions={
            'high-to-low':{price:-1},
            'low-to-high':{price:1},
        }
        const sortOption=req.query.sort&&sortOptions[req.query.sort]? sortOptions[req.query.sort] : { dateCreated: -1 };
        const storageList = await Storage.find(filter).sort(sortOption).populate('user', 'username').exec();
        if (!storageList || storageList.length === 0) {
            return res.status(204).json({ message: 'No Storages found' });
        }
        res.status(200).json(storageList);
        
    } catch (error) {
        console.error('Error fetching storage:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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
        res.status(200).json(userStorage)
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
    try {
        const files = req.files;
        let imagePaths = [];

        if (files && files.length > 0) {
            const basePath = `${req.protocol}://${req.get('host')}/public/upload/`; 
            files.forEach(file => {
                imagePaths.push(`${basePath}${file.filename}`);
            });
        }
        const storageData = {
            user: req.userId, 
            name: req.body.name,
            description: req.body.description, 
            city: req.body.city,
            price: req.body.price,
            category: req.body.category,
            mobileNo: req.body.mobileNo,
        };
        if (imagePaths.length > 0) {
            storageData.images = imagePaths;
        }
        const storage = await Storage.create(storageData);
        
        if (!storage) {
            return res.status(500).json({ 'message': 'Storage cannot be created' });
        }
        res.status(201).json(storage);
    } catch (err) {
        console.log(err);
        res.status(500).json({ 'message': 'Internal Server Error' }); 
    }
};
const deleteImageFromStorage = async (req, res) => {
    try {
        const storage = await Storage.findById(req.params.id);
        if (!storage) {
            return res.status(404).json({ message: 'Storage not found' });
        }
        
        if (storage.user.toString() !== req.userId) {
            return res.status(401).send('Not Allowed');
        }
        
        const imageIndex = parseInt(req.params.imageIndex);
        if ( imageIndex < 0 || imageIndex >= storage.images.length) {
            return res.status(404).json({ message: 'Invalid image index' });
        }
        const imageUrl = storage.images[imageIndex];
        const filename=imageUrl.substring(imageUrl.lastIndexOf('/')+1)
        const imagePath = path.join(__dirname, '..', 'public', 'upload', filename);
        console.log('Attempting to delete image at path:', imagePath);

        fs.unlink(imagePath, async (err) => {
            if (err) {
                console.error('Error deleting image file:', err);
                return res.status(500).json({ message: 'Error deleting image file' });
            }

            console.log('Image file deleted successfully');
            storage.images.splice(imageIndex, 1);
            await storage.save();
            return res.json({ message: 'Image deleted successfully', storage });
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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
        const files = req.files;
        let imagePaths = [];

        if (files && files.length > 0) {
            const basePath = `${req.protocol}://${req.get('host')}/public/upload/`; 
            files.forEach(file => {
                imagePaths.push(`${basePath}${file.filename}`);
            });
            if (storage.images.length + files.length > 8) {
                return res.status(400).json({ 'message': 'Cannot add more than 8 images' });
            }
        }
        if (!req.body.name && !req.body.description && !req.body.address && !req.body.price && !req.body.category && !files) {
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
        if (imagePaths.length > 0) {
            updateFields.$push ={images:{$each:imagePaths}};
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

const deleteStorage = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({'message': `Correct ID is required`});
        }
        const storage = await Storage.findByIdAndDelete({_id: req.params.id}).exec();
        if (!storage) {
            return res.status(404).json({'message': `No Storage matches ID ${req.body.id}`});
        }
        // Delete images asynchronously
        for (const image of storage.images) {
            const imageName = image.split('/').pop();
            const imagePath = path.join(__dirname, '..', 'public', 'upload',imageName);
            try {
                await fs.promises.unlink(imagePath);
                console.log(`Image file ${image} deleted successfully`);
            } catch (error) {
                console.error(`Error deleting image file ${image}:`, error);
                // Handle the error if needed
            }
        }
        // Send response after deleting storage and images
        return res.json({message: 'Storage and images deleted successfully'});
    } catch (error) {
        console.error('Error deleting storage:', error);
        return res.status(500).json({'message': 'Internal Server Error'});
    }
};

const storageCount=async(req,res)=>{
    try {
    const storageCount=await Storage.countDocuments();
    res.send({
        count: storageCount
    });
} catch (error) {
    console.error('Error counting users:', error);
    res.status(500).json({ 'message': 'Internal Server Error' });
}
}

module.exports = {
    getAllStorage,
    createNewStorage,
    getStorage,
    updateStorage,
    deleteStorage,
    storageCount,
    getStorageOfUser,
    deleteImageFromStorage
}