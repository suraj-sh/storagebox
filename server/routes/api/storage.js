const express = require('express');
const router = express.Router();
const storageController = require('../../controllers/storageController');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const verifyToken = require('../../middleware/verifyJWT');
const { uploadOptions } = require('../../middleware/uploadImage'); // Correct import statement

router.route('/')
    .get(storageController.getAllStorage)
    .post(verifyToken,
        verifyRoles(ROLES_LIST.Editor),
        uploadOptions, // Use the uploadOptions middleware
        storageController.createNewStorage
    );

router.route('/user')
    .get(
        verifyToken,
        verifyRoles(ROLES_LIST.Editor),
        storageController.getStorageOfUser
    );

router.route('/images/:id/:imageIndex')
    .delete(
        verifyToken,
        verifyRoles(ROLES_LIST.Editor),
        storageController.deleteImageFromStorage
    );

router.route('/:id')
    .get(storageController.getStorage)
    .delete(
        verifyToken,
        verifyRoles(ROLES_LIST.Editor, ROLES_LIST.Admin),
        storageController.deleteStorage
    )
    .put(
        verifyToken,
        verifyRoles(ROLES_LIST.Editor),
        uploadOptions, // Use the uploadOptions middleware
        storageController.updateStorage
    );

router.route('/get/count')
    .get(
        verifyToken,
        verifyRoles(ROLES_LIST.Admin),
        storageController.storageCount
    );

module.exports = router;
