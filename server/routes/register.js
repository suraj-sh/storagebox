const express=require('express');
const router=express.Router();
const registerController=require('../controllers/registerController');
const uploadDocument = require('../middlewere/uploadDocs');

router.route('/')
.post(uploadDocument.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'documentProof', maxCount: 1 },
  ]), registerController.handleNewUser);
;

router.route('/verify')
.post(uploadDocument.single('document'),registerController.verifyCodeAndSetPassword);

module.exports=router;