const express=require('express');
const router=express.Router();
const registerController=require('../controllers/registerController');

router.route('/')
.post(registerController.handleNewUser);

router.route('/verify')
.post(registerController.verifyCodeAndRegister);
module.exports=router;