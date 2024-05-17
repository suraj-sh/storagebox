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
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No documents uploaded' });
        }

        const files = req.files;
        req.fileUrls = {}; // Initialize an object to store file URLs

        // Iterate over the keys of files
        for (const fieldName of Object.keys(files)) {
            const file = files[fieldName][0];
            const fileName = `${Date.now()}-${file.originalname}`;
            const fileBuffer = file.buffer;

            // Upload the file to Firebase Storage
            const fileRef = bucket.file(`documents/${fileName}`);
            await fileRef.save(fileBuffer, {
                metadata: {
                    contentType: file.mimetype,
                },
            });

            // Generate a signed URL for the uploaded file
            const [url] = await fileRef.getSignedUrl({
                action: 'read',
                expires: '03-09-2491', // Set an appropriate expiration date
            });

            // Store the URL in req.fileUrls
            req.fileUrls[fieldName] = url;
        }

        next();
    } catch (error) {
        console.error('Error uploading document to Firebase Storage:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    createUploadMiddleware,
    uploadDocumentToFirebaseStorage,
};
