const multer = require('multer');
const admin = require('firebase-admin');
const { bucket } = require('../config/firebase'); // Adjust the path as needed

const uploadMiddleware = multer({
    storage: multer.memoryStorage(), // Use memory storage since we're uploading to Firebase Storage directly
    limits: { fileSize: 5 * 1024 * 1024 }, // Adjust file size limit as needed
});

const uploadOptions = uploadMiddleware.array('images', 8);
const uploadOptions2 = uploadMiddleware.single('image');

const uploadToFirebaseStorage = async (req, res, next) => {
    try {
        if (!req.file) {
            const uploadError = new Error('No file uploaded');
            uploadError.status = 400;
            throw uploadError;
        }

        const file = req.file;
        const fileName = `${Date.now()}-${file.originalname}`;
        const fileBuffer = file.buffer;

        const firebaseUpload = await bucket.upload(fileBuffer, {
            destination: `images/${fileName}`,
            metadata: {
                contentType: file.mimetype
            }
        });

        const firebaseFile = firebaseUpload[0];
        const url = await firebaseFile.getSignedUrl({ action: 'read', expires: '03-09-2491' });

        req.fileUrl = url; // Pass the Firebase Storage URL to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error uploading image to Firebase Storage:', error);
        res.status(error.status || 500).json({ message: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    uploadOptions,
    uploadOptions2
};

