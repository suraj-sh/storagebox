//cors origin resource sharing
const whitelist=[
    'https://storagebox.vercel.app',    // production server
    'https://storage-box.netlify.app',  // production client
    'http://localhost:3500',            // development server
    'http://localhost:4200'             // development client
];

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