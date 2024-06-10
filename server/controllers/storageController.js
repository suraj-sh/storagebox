const { default: mongoose } = require('mongoose');
const Storage = require('../model/Storage');
const { bucket } = require('../config/firebase');

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
        const sortOptions = {
            'high-to-low': { price: -1 },
            'low-to-high': { price: 1 },
        }
        const sortOption = req.query.sort && sortOptions[req.query.sort] ? sortOptions[req.query.sort] : { dateCreated: -1 };
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
        const userStorage = await Storage.find({ user: req.userId });
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
        let imageUrls = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const fileName = `${Date.now()}-${file.originalname}`;

                // Upload image file to Firebase Storage
                const fileUpload = bucket.file(`images/${fileName}`);
                await fileUpload.save(file.buffer, {
                    metadata: {
                        contentType: file.mimetype
                    }
                });

                // Get URL of uploaded image
                const [url] = await fileUpload.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491' // Adjust expiration as needed
                });

                imageUrls.push(url);
            }
        }

        // Store image URLs in MongoDB
        const storageData = {
            user: req.userId,
            name: req.body.name,
            description: req.body.description,
            city: req.body.city,
            price: req.body.price,
            category: req.body.category,
            mobileNo: req.body.mobileNo,
            images: imageUrls
        };

        const storage = await Storage.create(storageData);

        if (!storage) {
            return res.status(500).json({ 'message': 'Storage cannot be created' });
        }
        res.status(201).json(storage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'message': 'Internal Server Error' });
    }
}

const deleteImageUsingSignedUrl = async (signedUrl) => {
    try {
        const url = new URL(signedUrl);
        const filePath = decodeURIComponent(url.pathname.split('/').slice(2).join('/')); // Extract the path from the signed URL

        // Delete the file from Firebase Storage using the extracted file path
        const fileRef = bucket.file(filePath);
        await fileRef.delete();
        console.log('Image deleted successfully');
    } catch (error) {
        console.error('Error deleting image:', error.message);
        throw new Error('Failed to delete image');
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
        if (imageIndex < 0 || imageIndex >= storage.images.length) {
            return res.status(404).json({ message: 'Invalid image index' });
        }

        // Get the signed URL for the image from the storage
        const imageUrl = storage.images[imageIndex];

        // Delete the file using the signed URL
        await deleteImageUsingSignedUrl(imageUrl);

        // Remove the image URL from the storage document
        storage.images.splice(imageIndex, 1);

        // Save the updated storage document
        await storage.save();

        return res.json({ message: 'Image deleted successfully', storage });
    } catch (error) {
        console.error('Error deleting image:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const updateStorage = async (req, res) => {
    try {
        if (!req.params.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Correct ID parameter is required' });
        }
        
        const storage = await Storage.findById(req.params.id);
        if (!storage) {
            return res.status(404).json({ message: 'Storage not found' });
        }
        
        // Check if the user is allowed to update this storage
        if (storage.user.toString() !== req.userId) {
            return res.status(401).send("Not Allowed");
        }
        
        const files = req.files;
        let imageUrls = [];

        if (files && files.length > 0) {
            // Upload new images to Firebase Storage and get their URLs
            for (const file of files) {
                const fileName = `${Date.now()}-${file.originalname}`;
                
                // Create a reference to the file in Firebase Storage
                const fileUpload = bucket.file(`images/${fileName}`);
                await fileUpload.save(file.buffer, {
                    metadata: {
                        contentType: file.mimetype
                    }
                });

                // Get the signed URL for the uploaded file
                const [url] = await fileUpload.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491' // Adjust expiration as needed
                });

                imageUrls.push(url);
            }
        }

        // Update storage data in MongoDB with new image URLs
        let updateFields = {
            name: req.body.name,
            description: req.body.description,
            city: req.body.city,
            price: req.body.price,
            category: req.body.category,
            mobileNo: req.body.mobileNo,
            isRented: req.body.isRented,
            images: [...storage.images, ...imageUrls]
        };

        // Update storage record in MongoDB
        const updatedStorage = await Storage.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );

        if (!updatedStorage) {
            return res.status(500).json({ message: 'Storage cannot be updated' });
        }

        res.json(updatedStorage);
    } catch (error) {
        console.error('Error updating storage:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const deleteStorage = async (req, res) => {
    try {
        if (!req?.params?.id || !mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ 'message': `Correct ID is required` });
        }
        
        const storage = await Storage.findById(req.params.id);
        if (!storage) {
            return res.status(404).json({ 'message': `No Storage matches ID ${req.params.id}` });
        }
        
        // Check if the user is allowed to delete this storage
        if (storage.user.toString() !== req.userId) {
            return res.status(401).send("Not Allowed");
        }

        // Delete images from Firebase Storage
        for (const imageUrl of storage.images) {
            // Extract the file name from the signed URL
            const url = new URL(imageUrl);
            const filePath = url.pathname.split('/').slice(2).join('/');
            const fileRef = bucket.file(filePath);
            await fileRef.delete();
        }

        // Delete storage record from MongoDB
        await Storage.findByIdAndDelete(req.params.id);

        // Send response after deleting storage and images
        return res.json({ message: 'Storage and images deleted successfully' });
    } catch (error) {
        console.error('Error deleting storage:', error);
        return res.status(500).json({ 'message': 'Internal Server Error' });
    }
};


const storageCount = async (req, res) => {
    try {
        const storageCount = await Storage.countDocuments();
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