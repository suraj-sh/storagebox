const express=require('express');
const router=express.Router();
const path=require('path');
const userController=require('../../controllers/userscontroller');
const verifyRoles = require('../../middlewere/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');

router.route('/')
.get(userController.getAllUser)

router.route('/:id')
.get(userController.getUser)
.put(userController.updateUser)

router.route('/get/count')
.get(userController.usersCount);


module.exports=router;
