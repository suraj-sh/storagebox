const express=require('express');
const router=express.Router();
const path=require('path');
const userController=require('../../controllers/userscontroller');
const verifyRoles = require('../../middlewere/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');

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
.put(userController.updateUser)
.delete(verifyRoles(ROLES_LIST.Admin),userController.deleteUser);





module.exports=router;
