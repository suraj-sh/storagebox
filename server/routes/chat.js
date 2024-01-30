const express=require('express');
const router=express.Router();
const chatController=require('../controllers/chatController');

router.route('/')
.post((req,res)=>{
    const{sender,reciever,storage,cotent}=req.body;

chatController.saveChatMessage(req.app.get('io').req.app.get('socket'),{
    sender,
    reciever,
    storage,
    cotent
}).then((result)=>{
    if(result.success){
        res.status(201).json(result);
    }else{
        res.status(400).json(result);
    }
});
});
module.exports=router;