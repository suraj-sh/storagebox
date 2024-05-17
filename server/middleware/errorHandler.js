const { logEvents } = require("./logEvents");

const errorhandler=(err,req,res,next)=>{
    logEvents(`${err.name}:${err.message}`,'errorLog.txt');
    console.log(err.stack);
    res.status(500).send(err.massage);
}

module.exports=errorhandler;