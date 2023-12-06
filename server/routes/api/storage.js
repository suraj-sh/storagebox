const express=require('express');
const router=express.Router();
const path=require('path');
const storageController=require('../../controllers/storageController');
const verifyRoles = require('../../middlewere/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
const verifyToken = require('../../middlewere/verifyJWT');
router.route('/')
.get(storageController.getAllStorage)
.post(verifyToken,storageController.createNewStorage)

router.route('/:id')
.get(verifyToken,storageController.getStorage)
.delete(verifyToken,verifyRoles(ROLES_LIST.Admin),storageController.deleteStorage)
.put(verifyToken,storageController.updateStorage)

router.route('/get/count').
get(verifyToken,storageController.storageCount);
module.exports=router;
