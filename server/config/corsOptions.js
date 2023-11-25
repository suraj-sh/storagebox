//cors origin resource sharing
const whitelist=['https://www.mysite.com',
'https://localhost:3000',
'https://localhost:3500'];
const corsOptions={
    origin:(origin,callback)=>{
        if(whitelist.indexOf(origin)!==-1||!origin){
            callback(null,true);
        }else{
            callback(new Error('Not allowed by CORS'));
        }
    }
}
module.exports=corsOptions;