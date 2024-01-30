const express=require('express');
const router=express.Router();
const path=require('path');
const userController=require('../../controllers/userscontroller');
const verifyRoles = require('../../middlewere/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const uploadDocument = require('../../middlewere/uploadDocs');
const uploadOptions = require('../../middlewere/uploadImage');

router.route('/')
.get(verifyRoles(ROLES_LIST.Admin),userController.getAllUser)

router.route('/seller')
.get(verifyRoles(ROLES_LIST.Admin),userController.getSellerUsers);

router.route('/get/count')
.get(verifyRoles(ROLES_LIST.Admin),userController.usersCount);

router.route('/change-role/:id')
.put(verifyRoles(ROLES_LIST.Admin),userController.changeUserRole);

router.route('/change-role-user/:id')
.put(verifyRoles(ROLES_LIST.Admin),userController.changeEditorRole);

router.route('/:id')
.get(userController.getUser)
.put(uploadDocument.fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'documentProof', maxCount: 1 },
]),userController.updateUser)
.delete(verifyRoles(ROLES_LIST.Admin),userController.deleteUser);

router.route('/profile/:id')
.put(uploadOptions.single('image'),userController.updateUserPic)
.delete(userController.deleteUserPic);

router.route('/idProof/:id')
.delete(userController.deleteIdProof);
router.route('/docProof/:id')
.delete(userController.deleteDocumentProof);

module.exports=router;
