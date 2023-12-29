const User = require('../model/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../middlewere/email');

const generateVerificationCode = () => {
  const code = Math.random().toString().slice(2, 8);
  const timestamp = Date.now();
  return { code, timestamp };
};

const temporaryStorage = {};

const handleNewUser = [
  body('user', 'Name should contain at least 6 alphabets').isLength({ min: 6 }),
  body('email', 'Enter a valid email').isEmail(),
  body('pwd', 'Enter at least one alphabet and one number').isLength({ min: 6 }),
  body('isSeller').isBoolean().toBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user, pwd, email, isSeller } = req.body;
    if (!user || !pwd || !email) {
      return res.status(400).json({ 'message': 'Username, email, password, and user status are required' });
    }

    try {
      const duplicate = await User.findOne({ username: user }).exec();
      if (duplicate) return res.status(409).json({ 'message': 'Username already exists' });

      const userEmail = await User.findOne({ email: email });
      if (userEmail) return res.status(400).json({ 'message': 'Email already exists' });

      const verificationCodeData = generateVerificationCode();

      const hashedPwd = await bcrypt.hash(pwd, 10);

      await sendEmail({
        email,
        subject: 'Email Verification Code',
        message: `Hello ${user},\n\nThank you for registering with StorageBox! Your verification code is: ${verificationCodeData.code}\n\nPlease use this code to complete your registration within the next 3 minutes.\n\nIf you didn't request this code, please ignore this email.

Thank you,
The StorageBox Team`

      });

      temporaryStorage[verificationCodeData.code] = {
        user,
        pwd: hashedPwd,
        isSeller,
        email,
        verificationCode: verificationCodeData.code,
        timestamp: verificationCodeData.timestamp,
      };
      console.log(temporaryStorage);

      res.status(200).json({
        success: `Verification code sent to ${email}. User registration pending verification.`,
      });
    } catch (err) {
      res.status(400).json({ 'message': err.message });
    }
  }
];

const verifyCodeAndRegister = async (req, res) => {
  const { verificationCode } = req.body;

  if (!verificationCode) {
    return res.status(400).json({ 'message': 'Verification code is required' });
  }

  try {
    const storedData = temporaryStorage[verificationCode];
    
    if (!storedData || !storedData.verificationCode) {
      return res.status(400).json({ 'message': 'Invalid verification code' });
    }
    const currentTimestamp = Date.now();
    const codeTimestamp = storedData.timestamp;
    const codeExpiration = 3 * 60 * 1000; 
    if (currentTimestamp - codeTimestamp > codeExpiration) {
      return res.status(400).json({ 'message': 'Verification code has expired' });
    }
    if (storedData.verificationCode.toString() !== verificationCode) {
      return res.status(400).json({ 'message': 'Invalid verification code' });
    }

    const result = await User.create({
      username: storedData.user,
      email: storedData.email,
      password: storedData.pwd,
      isSeller: storedData.isSeller,
    });

    delete temporaryStorage[verificationCode];

    res.status(200).json({
      'message': 'User registered successfully',
      'user': result,
    });
  } catch (err) {
    res.status(400).json({ 'message': err.message });
  }
};

module.exports = {
  handleNewUser,
  verifyCodeAndRegister
};
