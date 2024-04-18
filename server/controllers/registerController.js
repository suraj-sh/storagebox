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
       
      const basePath = `https://storagebox.onrender.com/public/document/`;
      const idProof = req.files && req.files['idProof'] ? `${basePath}${req.files['idProof'][0].filename}` : null;
      const documentProof = req.files && req.files['documentProof'] ? `${basePath}${req.files['documentProof'][0].filename}` : null;

      await new Promise(resolve => setTimeout(resolve, 1000));

      temporaryStorage[email] = {
        user,
        email,
        isSeller,
        verificationCode: verificationCodeData.code,
        timestamp: verificationCodeData.timestamp,
        idProof,
        documentProof,
      };
      await sendEmail({
        email,
        subject: 'Email Verification Code',
        message: `Hello ${user},\n\nThank you for registering with StorageBox! Your verification code is: ${verificationCodeData.code}\n\nPlease use this code to complete your registration within the next 5 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nThank you,\nThe StorageBox Team`
      });

      res.status(200).json({
        success: `Verification code sent to ${email}. User registration pending verification.`,
      });
    } catch (err) {
      res.status(400).json({ 'message': err.message });
    }
  }
];

const verifyCodeAndSetPassword = [ 
  body('pwd', 'Enter at least one alphabet and one number').isLength({ min: 6 }),
  async (req, res) => {
    const { verificationCode, pwd } = req.body;

    if (!verificationCode || !pwd) {
      return res.status(400).json({ 'message': 'Verification code and password are required' });
    }

    try {
      // Fetch email from temporary storage
      const storedData = Object.values(temporaryStorage)[0];

      if (!storedData || !storedData.verificationCode || storedData.codeUsed) {
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

      // Update stored data with the user-provided password and mark code as used
      storedData.pwd = await bcrypt.hash(pwd, 10);
      storedData.codeUsed = true;

      // Create the user account
      const result = await User.create({
        username: storedData.user,
        email: storedData.email,
        password: storedData.pwd,
        isSeller: storedData.isSeller,
        idProof: storedData.idProof,
        documentProof: storedData.documentProof
      });

      if (storedData.isSeller) {  
        const message=`Thank you for registering with StorageBox!

Your account is currently under verification. During this process, you won't be able to list any ads. Our team will review your account details, and we'll notify you once the verification is complete.
Please note that once your account is verified, any uploaded documents will be automatically deleted from our system, as they are only needed for verification purposes.

If you have any questions or concerns, feel free to reach out to us.
        
Thank you,
The StorageBox Team`
         
        await sendEmail({
            email: storedData.email,
            subject: `Seller's Account Verification`,
            message
        });
    }
      // Remove stored data from temporary storage
      delete temporaryStorage[storedData.email];
     
      res.status(200).json({
        'message': 'User registered successfully',
        'user': result,
      });
    } catch (err) {
      res.status(400).json({ 'message': err.message });
    }
  }
];

module.exports = {
  handleNewUser,
  verifyCodeAndSetPassword
};

