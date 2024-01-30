const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storageMiddleware = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        if (!isValid) {
            const uploadError = new Error('Invalid file type');
            return cb(uploadError, 'public/upload');
        }
        cb(null, 'public/upload');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({
    storage: storageMiddleware,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = uploadOptions;
