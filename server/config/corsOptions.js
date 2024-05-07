//cors origin resource sharing
const whitelist=['https://storagebox.onrender.com',
'https://storage-box.netlify.app',
'https://vercel.com/surajs-projects-00bb4e84/storagebox/793cd1Gyzye7FgxLZedmLQMpZgom',
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
