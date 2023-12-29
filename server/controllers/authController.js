const User = require('../model/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../middlewere/email');
const { user } = require('../config/roles_list');
const errorhandler = require('../middlewere/errorHandler');

const handleLogin = async (req, res) => {
    const { user, email, pwd } = req.body;
    if (!(user || email) || !pwd) {
        return res.status(400).json({ 'message': 'Username or email and password are required' });
    }
    const foundUser = await User.findOne({ $or: [{ username: user }, { email: email }], }).exec();
    if (!foundUser) return res.sendStatus(401);
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const roles = Object.values(foundUser.roles);
        const acessToken = jwt.sign(
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
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        //Saving refresh Token with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        console.log(result);
        res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ acessToken });
    } else {
        res.sendStatus(401);
    }
}

const forgotpassword = async (req, res, next) => {
    let userData;

    try {
        userData = await User.findOne({ email: req.body.email });
        if (!userData) {
            return res.status(400).json({ success: false, msg: "This email does not exist" });
        }

        const resetToken = userData.createResetPassword();
        await userData.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get('host')}/auth/resetpassword/${resetToken}`;
        const message = `Dear ${userData.username},
We received a request to reset the password associated with your StorageBox account. For your security, please follow the instructions below to complete the process:

1. Click on the following link to reset your password:
${resetUrl}\n\n
2. This link is valid for the next 10 minutes.

If you did not initiate this password reset, please contact our support team immediately at support@storagebox.com.

Thank you,
The StorageBox Team`

        await sendEmail({
            email: userData.email,
            subject: 'Password change request received',
            message: message
        });

        res.status(200).json({ message: 'Password reset link sent to user email' });
    } catch (err) {
        if (userData) {
            userData.passwordResetToken = undefined;
            userData.passwordResetTokenExpires = undefined;
            await userData.save({ validateBeforeSave: false });
        }

        return res.status(500).json({ message: err.message });
    }
};

const resetpassword = async (req, res, next) => {
    try {
        const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const userData = await User.findOne({
            passwordResetToken: token,
            passwordResetTokenExpires: { $gt: Date.now() },
        });

        if (!userData) {
            const error = res.status(400).json({ message: "Token invalid or expired" });
            return next(error);
        }

        // Ensure that the request body contains a password
        if (!req.body.password) {
            const error = res.status(400).json({ message: "Password is required" });
            return next(error);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Update user data
        userData.password = hashedPassword;
        userData.passwordResetToken = '';
        userData.passwordResetTokenExpires = '';
        userData.passwordChangedAt = Date.now();

        await userData.save();

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        const error = res.status(500).json({ message: "There was an error processing the request" });
        return next(error);
    }
};

module.exports = {
    handleLogin,
    forgotpassword,
    resetpassword,
};

//sameSite:'None'
//const ohterUsers=userDB.users.filter(person=>person.username !==foundUser.username);
// const currentUser={...foundUser,refreshToken};
// userDB.setUsers([...ohterUsers,currentUser]);
// await fsPromises.writeFile(path.join(__dirname,'..','model','users.json'),
//     JSON.stringify(userDB.users),
// ) 