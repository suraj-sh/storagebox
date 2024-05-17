const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');
const { createUploadMiddleware } = require('../middleware/uploadDocs');

router.route('/')
    .post(
        createUploadMiddleware([
            { name: 'idProof', maxCount: 1 },
            { name: 'documentProof', maxCount: 1 }
        ]),
        registerController.handleNewUser
    );

router.route('/verify')
    .post(
        createUploadMiddleware([{ name: 'document', maxCount: 1 }]),
        registerController.verifyCodeAndSetPassword
    );

module.exports = router;
