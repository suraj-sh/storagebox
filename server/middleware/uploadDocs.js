const multer = require('multer');
const { bucket } = require('../config/firebase');

// Multer storage configuration to store files in memory
const storage = multer.memoryStorage();
const limits = { fileSize: 10 * 1024 * 1024 }; // Set file size limit to 10MB

// File filter to allow only PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

// Create upload middleware with specified field options
const createUploadMiddleware = (fieldOptions) => {
    return multer({ storage, limits, fileFilter }).fields(fieldOptions);
};

// Middleware to upload document to Firebase Storage
const uploadDocumentToFirebaseStorage = async (req, res, next) => {
    try {
        if (req.files) {
            req.fileUrls = {};
            for (const [key, file] of Object.entries(req.files)) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const fileBuffer = file.buffer;

                const fileRef = bucket.file(`documents/${fileName}`);
                await fileRef.save(fileBuffer, {
                    metadata: {
                        contentType: file.mimetype,
                    },
                });

                const [url] = await fileRef.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491', // Set an appropriate expiration date
                });

                req.fileUrls[key] = url;
            }
        }
        next();
    } catch (error) {
        console.error('Error uploading document to Firebase Storage:', error);
        res.status(500).json({ 'message': 'Error uploading document' });
    }
};


module.exports = {
    createUploadMiddleware,
    uploadDocumentToFirebaseStorage,
};
