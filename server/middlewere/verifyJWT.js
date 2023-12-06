const jwt = require('jsonwebtoken');
require('dotenv').config();
const unless=require('express-unless');
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorized: No token provided');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.user = decoded.UserInfo.user;
        req.roles = decoded.UserInfo.roles;
        req.userId = decoded.UserInfo.userId;
        next();
    } catch (error) {
        console.error('Token verification error:', error);

        // Token verification failed
        return res.status(401).send('Unauthorized: Invalid token');
    }

};

module.exports = verifyToken;
