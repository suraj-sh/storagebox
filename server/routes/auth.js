const express=require('express');
const router=express.Router();
const authController=require('../controllers/authController');

router.route('/')
.post(authController.handleLogin);

router.route('/forgotpassword')
.post(authController.forgotpassword);

router.route('/resetpassword/:token')
.patch(authController.resetpassword);
module.exports=router;