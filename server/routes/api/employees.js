const express=require('express');
const router=express.Router();
const path=require('path');
const employeeControler=require('../../controllers/employeesController');
const  verifyRoles  = require('../../middlewere/verifyRoles');
const ROLES_LIST = require('../../config/roles_list');
router.route('/')
.get(employeeControler.getAllEmployees)
.post(verifyRoles(ROLES_LIST.user,ROLES_LIST.Editor,ROLES_LIST.Admin), employeeControler.createNewEmployee)
.put(verifyRoles(ROLES_LIST.Editor,ROLES_LIST.Admin), employeeControler.updateEmployee)
.delete(verifyRoles(ROLES_LIST.Admin),employeeControler.deleteEmployee);
router.route('/:id')
.get(employeeControler.getEmployee);
module.exports=router;
