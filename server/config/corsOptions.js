//cors origin resource sharing
const whitelist=['https://www.mysite.com',
'http://localhost:3000',
'http://localhost:3500',
'http://localhost:4200',
'https://storagebox.onrender.com'];
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
