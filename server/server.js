require('dotenv').config();
const express=require('express');
const app=express();
const path=require('path');
const {logger}=require('./middlewere/logEvents');
const cors=require('cors');
const corsOptions=require('./config/corsOptions');
const errorhandler = require('./middlewere/errorHandler');
const verifyToken = require('./middlewere/verifyJWT');
const mongoose=require('mongoose')
const cookieParser = require('cookie-parser');
const connectDB=require('./config/dbConn');
const PORT=process.env.PORT|| 3500;

//custom middlewere
app.use(logger);

//third-party middleware cross origin resource sharing
app.use(cors(corsOptions));

//built-in middleware to handle urlencoded data
//in other words,from data:
//'content-type':application/x-www-form-urlencoded
app.use(express.urlencoded({extended:false}));

//build-in middleware for json
app.use(express.json());

//middleware for cookie
app.use(cookieParser()); 

//serve static files
app.use('/',express.static(path.join(__dirname,'/public')));
// connect to db
connectDB(); 
app.use('/',require('./routes/root'));
app.use('/register',require('./routes/register'));
app.use('/auth',require('./routes/auth'));
 app.use('/refresh',require('./routes/refreshToken'));
 app.use('/logout',require('./routes/logout'));
 app.use(verifyToken);
app.use('/employees',require('./routes/api/employees'));

app.all('*',(req,res)=>{
    
    res.status(404);
    if(req.accepts('html')){
     res.sendFile(path.join(__dirname,'views','404.html'));
    }else if(req.accepts('json')){
        res.json({error:"404 not found"});
    }else{
        res.type('txt').send("404 not found"); 
      }
});

app.use(errorhandler);

mongoose.connection.once('open',()=>{
  console.log("connect to MongoDB");
  app.listen(PORT, (error) => {
    if (error) {
      console.error('Error starting the server:', error);
    } else {
      console.log(`Server running on port ${PORT}`);
    }
});
  
})



// app.get('/hello.',(req,res,next)=>{
//     console.log('attempted to load hello.html');
//     next();
// },(req,res)=>{
//     res.send('hello world');
// });
// const one=(req,res,next)=>{
//     console.log("one");
//     next();
// }
// const two=(req,res,next)=>{
//     console.log("two");
//     next();
// }
// const three=(req,res,next)=>{
//     console.log("three");
//     res.send('Finished');
// }

// app.get('chain(.html)?',[one,two,three]);