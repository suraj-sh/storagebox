const multer = require('multer');


const FILE_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}
// Middleware function for Multer setup
const storageMiddleware = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid=FILE_TYPE_MAP[file.mimetype];
    let uploadError=new Error('invalid image type');
    if(isValid){
        uploadError=null;
    }
    cb(uploadError, 'public/upload');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension=FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

// Create Multer middleware using the storage configuration
const uploadOptions = multer({ storage: storageMiddleware });

// Export the middleware for use in routes
module.exports = uploadOptions;
