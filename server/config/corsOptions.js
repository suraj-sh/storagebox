//cors origin resource sharing
const whitelist=['https://storagebox.onrender.com',
'https://storage-box.netlify.app',
'https://storagebox.vercel.app',
'http://localhost:3500',
'http://localhost:4200'];
const corsOptions={
    origin:(origin,callback)=>{
        if(whitelist.indexOf(origin)!==-1||!origin){
            callback(null,true);
        }else{
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}
module.exports=corsOptions;
