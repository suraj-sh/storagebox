const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const verifyRoles = require('../../middleware/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const { uploadOptions2 } = require('../../middleware/uploadImage');
const { createUploadMiddleware } = require('../../middleware/uploadDocs');

router.route('/')
    .get(verifyRoles(ROLES_LIST.Admin), userController.getAllUser);

router.route('/seller')
    .get(verifyRoles(ROLES_LIST.Admin), userController.getSellerUsers);

router.route('/get/count')
    .get(verifyRoles(ROLES_LIST.Admin), userController.usersCount);

router.route('/seller-count')
    .get(verifyRoles(ROLES_LIST.Admin), userController.sellerCount);

router.route('/verifiedSeller-count')
    .get(verifyRoles(ROLES_LIST.Admin), userController.verifiedSellerCount);

router.route('/change-role/:id')
    .put(verifyRoles(ROLES_LIST.Admin), userController.changeUserRole);

router.route('/change-role-user/:id')
    .put(verifyRoles(ROLES_LIST.Admin), userController.changeEditorRole);

router.route('/email/:id')
    .post(verifyRoles(ROLES_LIST.Admin), userController.wrongCredentials);

router.route('/:id')
    .get(userController.getUser)
    .put(userController.updateUser)
    .delete(verifyRoles(ROLES_LIST.Admin), userController.deleteUser);

router.route('/profile/:id')
    .put(uploadOptions2, userController.updateUserPic)
    .delete(userController.deleteUserPic);

router.route('/update-proof/:id')
    .put(
        createUploadMiddleware([
            { name: 'idProof', maxCount: 1 },
            { name: 'documentProof', maxCount: 1 }
        ]),
        userController.updateSellerDocument
    );

router.route('/idProof/:id')
    .delete(userController.deleteIdProof);

router.route('/docProof/:id')
    .delete(userController.deleteDocumentProof);

module.exports = router;