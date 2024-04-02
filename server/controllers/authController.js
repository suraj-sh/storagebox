const User = require('../model/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../middlewere/email');
const { user } = require('../config/roles_list');
const errorhandler = require('../middlewere/errorHandler');
const userToken=require('../model/UserToken');

const handleLogin = async (req, res) => {
    const cookies =req.cookies;
    console.log(cookies)
    const { user, email, pwd } = req.body;
    if (!(user || email) || !pwd) {
        return res.status(400).json({ 'message': 'Username or email and password are required' });
    }
    const foundUser = await User.findOne({ $or: [{ username: user }, { email: email }], }).exec();
    if (!foundUser) return res.sendStatus(401);
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles);
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "userId": foundUser._id,
                    "username": foundUser.username,
                    "roles": roles,
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '5m' }
        );
        const newRefreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        let newRefreshTokenArray =
            !cookies?.jwt
                ? foundUser.refreshToken
                : foundUser.refreshToken.filter(rt=>rt !== cookies.jwt)

        if(cookies?.jwt)
        {
            const refreshToken= cookies.jwt;
            const foundToken=await User.findOne({refreshToken}).exec();
            
            if(!foundToken){
                console.log('attempted refresh token reasue at login');
                newRefreshTokenArray=[];
            }
            res.clearCookie('jwt',{ httpOnly:true} );//secure:true -only serves on http
    }
        //Saving refresh Token with current user
        foundUser.refreshToken = [...newRefreshTokenArray,newRefreshToken];
        const result = await foundUser.save();
        console.log(result);
        res.cookie('jwt', newRefreshToken, { httpOnly: true, maxAge: 24*60*60*1000});
        res.json({ accessToken});
    } else {
        res.sendStatus(401);
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, msg: "This email does not exist" });
        }
        const resetToken = jwt.sign({ email: user.email }, process.env.RESET_TOKEN_SECRET, { expiresIn: 300 });
        const newUserToken = new userToken({
            userId: user._id,
            token: resetToken
        });
        await newUserToken.save();
        await user.save({ validateBeforeSave: false });
        const resetUrl = `${req.protocol}://localhost:4200/reset-password/${resetToken}`
        await sendEmail({
            email: user.email,
            subject: 'Password change request received',
            html:`
            <html>
            <head>
            <title>Password Reset Request</title>
            </head>
            <body>
                <h3>Password Reset Request</h3>
                <p>Dear ${user.username},</p>
                <p>We have received a request to reset your password for your account with StorageBox. To complete the password reset process, click on the button below:</p>
                <a href="${resetUrl}" style="text-decoration: none;">
                <button style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: background-color 0.3s;">Reset Password</button></a>
                <p>The link will be valid for 5mins.If you did not request a password reset, please ignore this message.</p>
                <p>Thank you,<br>
                StorageBox Team</p>
            </body>
            </html>`,
        });
        res.status(200).json({ message: 'Password reset link sent to user email' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
        await userToken.findOneAndDelete({ userId: user._id });
    }
};

const resetPassword = async (req, res) => {
    try {
        const token = req.params.token;
        const password = req.body.password;

        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }
        const decodedToken = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
        const user = await User.findOne({ email: decodedToken.email });
        if (!user) {
            return res.status(500).json({ message: "Reset Token Expired" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await User.findByIdAndUpdate(user._id, { $set: { password: hashedPassword } }, { new: true });
        res.status(200).json({ message: "Password reset successfully", updatedUser });
         // Delete the token from UserToken collection after password reset
         await userToken.findOneAndDelete({ userId: user._id });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

module.exports = {
    handleLogin,
    forgotPassword,
    resetPassword,
};

//sameSite:'None'
//const ohterUsers=userDB.users.filter(person=>person.username !==foundUser.username);
// const currentUser={...foundUser,refreshToken};
// userDB.setUsers([...ohterUsers,currentUser]);
// await fsPromises.writeFile(path.join(__dirname,'..','model','users.json'),
//     JSON.stringify(userDB.users),
// ) 