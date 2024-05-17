const User = require('../model/User');
const UserToken = require('../model/UserToken');

const handleLogout = async (req, res) => {
    //on client,also delete the acess token
    const refreshToken = req.cookies.jwt; // Retrieving 'jwt' cookie directly

    if (!refreshToken) {
        return res.sendStatus(204);
    }
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true });
        return res.sendStatus(403);
    }
    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);
    await UserToken.findOneAndDelete({ userId: foundUser._id });
    const result = await foundUser.save();

    res.clearCookie('jwt', { httpOnly: true });//secure:true -only serves on http
    res.sendStatus(204);
};

module.exports = {
    handleLogout
};
