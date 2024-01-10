const multer = require('multer');


const FILE_TYPE_MAP={
    'application/pdf': 'pdf',
    'application/msword': 'doc',
}
// Middleware function for Multer setup
const storageMiddleware = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Incoming file:', file);
    const isValid=FILE_TYPE_MAP[file.mimetype];
    let uploadError=new Error('invalid document type');
    if(isValid){
        uploadError=null;
    }
    cb(uploadError, 'public/document');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension=FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

// Create Multer middleware using the storage configuration
const uploadDocument = multer({ storage: storageMiddleware });

// Export the middleware for use in routes
module.exports = uploadDocument;
