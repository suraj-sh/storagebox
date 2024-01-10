const User=require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken =async (req, res) => {
    const refreshToken = req.cookies.jwt; // Retrieving 'jwt' cookie directly

    if (!refreshToken) {
        return res.sendStatus(401);
    }
    res.clearCookie('jwt',{ httpOnly:true,maxAge:24*60*60*1000});
    const foundUser = await User.findOne({refreshToken}).exec();
    if (!foundUser) {
        jwt.verify(
            refreshToken, process.env.REFRESH_TOKEN_SECRET, 
           async (err, decoded) => {
            if(err) return res.sendStatus(403);
            const hackedUser=await User.findOne({username:decoded.username}).exec();
            hackedUser.refreshToken=[];
            const result=await hackedUser.save();
            }
        )
        return res.sendStatus(401);
    }
    const newRefreshTokenArray=foundUser.refreshToken.filter(rt=>rt!==refreshToken);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,async (err, decoded) => {
        if(err){
            foundUser.refreshToken=[...newRefreshTokenArray];
            const result=await foundUser.save();
            console.log(result);
        }
        if (err || foundUser.username !== decoded.username) {
            return res.sendStatus(403);
        }
        const roles=Object.values(foundUser.roles);
        const accessToken = jwt.sign(
            {"UserInfo":{
                "userId":foundUser._id,
                "username":foundUser.username,
                "roles":roles,
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn:  '5m' }
        );
        const NewRefreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        //Saving refresh Token with current user
        foundUser.refreshToken = [...newRefreshTokenArray,NewRefreshToken];
        const result=await foundUser.save();
        res.cookie('jwt', NewRefreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accessToken });
    });
};

module.exports = {
    handleRefreshToken
};