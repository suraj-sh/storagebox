const User = require('../model/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../middlewere/email');
const uploadDocument = require('../middlewere/uploadDocs');

const generateVerificationCode = () => {
  const code = Math.random().toString().slice(2, 8);
  const timestamp = Date.now();
  return { code, timestamp };
};

const temporaryStorage = {};

const handleNewUser = [
  body('user', 'Name should contain at least 6 alphabets').isLength({ min: 6 }),
  body('email', 'Enter a valid email').isEmail(),
  body('isSeller').isBoolean().toBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user, email, isSeller } = req.body;
    if (!user || !email) {
      return res.status(400).json({ 'message': 'Username, email, and user status are required' });
    }
    try {
      const duplicate = await User.findOne({ username: user }).exec();
      if (duplicate) return res.status(409).json({ 'message': 'Username already exists' });
      const userEmail = await User.findOne({ email: email });
      if (userEmail) return res.status(400).json({ 'message': 'Email already exists' });
      const verificationCodeData = generateVerificationCode();
      await sendEmail({
        email,
        subject: 'Email Verification Code',
        message: `Hello ${user},\n\nThank you for registering with StorageBox! Your verification code is: ${verificationCodeData.code}\n\nPlease use this code to complete your registration within the next 5 minutes.\n\nIf you didn't request this code, please ignore this email.

Thank you,
The StorageBox Team`
      });

      const  basePath=`${req.protocol}://${req.get('host')}/public/document/`;
      const documentPath = req.files && req.files['documentPath'] ? `${basePath}${req.files['documentPath'][0].filename}` : null;
      const documentFile = req.files && req.files['documentFile'] ? `${basePath}${req.files['documentFile'][0].filename}` : null;

      temporaryStorage[verificationCodeData.code] = {
        user,
        email,
        isSeller,
        verificationCode: verificationCodeData.code,
        timestamp: verificationCodeData.timestamp,
        documentPath,
        documentFile,
      };
      res.status(200).json({
        success: `Verification code sent to ${email}. User registration pending verification.`,
      });
    } catch (err) {
      res.status(400).json({ 'message': err.message });
    }
  }
];


const verifyCodeAndSetPassword =[ 
  body('pwd', 'Enter at least one alphabet and one number').isLength({ min: 6 }),
  async (req, res) => {
  const { verificationCode, pwd } = req.body;

  if (!verificationCode || !pwd) {
    return res.status(400).json({ 'message': 'Verification code and password are required' });
  }

  try {
    const storedData = temporaryStorage[verificationCode];
    
    if (!storedData || !storedData.verificationCode) {
      return res.status(400).json({ 'message': 'Invalid verification code' });
    }

    const currentTimestamp = Date.now();
    const codeTimestamp = storedData.timestamp;
    const codeExpiration = 5 * 60 * 1000; 
    if (currentTimestamp - codeTimestamp > codeExpiration) {
      return res.status(400).json({ 'message': 'Verification code has expired' });
    }
    if (storedData.verificationCode.toString() !== verificationCode) {
      return res.status(400).json({ 'message': 'Invalid verification code' });
    }

    if (storedData.pwd) {
      return res.status(400).json({ 'message': 'Password has already been set' });
    }
    // Update stored data with the user-provided password
    storedData.pwd = await bcrypt.hash(pwd, 10);

    // Create the user account
    const result = await User.create({
      username: storedData.user,
      email: storedData.email,
      password: storedData.pwd,
      isSeller: storedData.isSeller,
      idProof:storedData.documentPath,
      DoucemntProof:storedData.documentFile
    });

    // Remove stored data from temporary storage
    delete temporaryStorage[verificationCode];

    res.status(200).json({
      'message': 'User registered successfully',
      'user': result,
    });
  } catch (err) {
    res.status(400).json({ 'message': err.message });
  }
}];

module.exports = {
  handleNewUser,
  verifyCodeAndSetPassword
};
