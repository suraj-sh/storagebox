const express=require('express');
const router=express.Router();
const storageController=require('../../controllers/storageController');
const verifyRoles = require('../../middlewere/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const verifyToken = require('../../middlewere/verifyJWT');
const uploadOptions = require('../../middlewere/uploadImage');
router.route('/')
.get(storageController.getAllStorage)
.post(verifyToken,verifyRoles(ROLES_LIST.Editor), uploadOptions.array('images',8),storageController.createNewStorage)

router.route('/user')
.get(verifyToken,verifyRoles(ROLES_LIST.Editor),storageController.getStorageOfUser);

router.route('/images/:id/:imageName')
.delete(verifyToken,verifyRoles(ROLES_LIST.Editor),verifyToken, storageController.deleteImageFromStorage);

router.route('/:id')
.get(storageController.getStorage)
.delete(verifyToken,verifyToken,verifyRoles(ROLES_LIST.Editor,ROLES_LIST.Admin),storageController.deleteStorage)
.put(verifyToken,verifyRoles(ROLES_LIST.Editor),uploadOptions.array('images',8),storageController.updateStorage)

router.route('/get/count')
.get(verifyToken,verifyRoles(ROLES_LIST.Admin),storageController.storageCount);

module.exports=router;
