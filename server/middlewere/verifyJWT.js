const jwt = require('jsonwebtoken');
require('dotenv').config();
const unless=require('express-unless');
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log('Authorization Header:', authHeader);
    if (!authHeader) {
        return res.status(401).send('Unauthorized: No token provided');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log('Decoded Token:', decoded);
        req.user = decoded.UserInfo.username;
        console.log(req.user);
        req.roles = decoded.UserInfo.roles;
        req.userId = decoded.UserInfo.userId;        
        console.log(req.userId);
        next();
    } catch (error) {
        console.error('Token verification error:', error);

        // Token verification failed
        return res.status(401).send('Unauthorized: Invalid token');
    }

};

module.exports = verifyToken;
