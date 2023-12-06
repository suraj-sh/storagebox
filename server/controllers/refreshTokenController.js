const User=require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken =async (req, res) => {
    const refreshToken = req.cookies.jwt; // Retrieving 'jwt' cookie directly

    if (!refreshToken) {
        return res.sendStatus(401);
    }

    const foundUser = await User.findOne({refreshToken}).exec();
    if (!foundUser) {
        return res.sendStatus(401);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
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
            { expiresIn: '60s' }
        );

        res.json({ accessToken });
    });
};

module.exports = {
    handleRefreshToken
};