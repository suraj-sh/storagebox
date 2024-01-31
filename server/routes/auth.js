const express=require('express');
const router=express.Router();
const authController=require('../controllers/authController');

router.route('/')
.post(authController.handleLogin);

router.route('/forgotpassword')
.post(authController.forgotPassword);

router.route('/resetpassword/:token')
.post(authController.resetPassword);
module.exports=router;