const User = require('../model/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const handleNewUser = [
  body('user', 'Enter a valid name').isLength({ min: 10 }),
  body('email','Enter the valid email').isEmail(),
  body('pwd', 'Enter at least one alphabet and one number').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user, pwd,email } = req.body;
    if (!user||!pwd||!email) return res.status(400).json({ 'message': 'Username,email and password are required' });

    // Find duplicate
    try {
      const duplicate = await User.findOne({ username: user }).exec();
      if (duplicate) return res.status(409).json({ 'message': 'Username already exists' });

      const hashedPwd = await bcrypt.hash(pwd, 10);

      const result = await User.create({
        "username": user,
        "email":email,
        "password": hashedPwd
      });

      console.log(result);
      res.status(200).json({ 'success': `New user ${user} created!` });
    } catch (err) {
      res.status(400).json({ 'message': err.message });
    }
  }
];

module.exports = {
  handleNewUser
};
// userDB.setUsers([...userDB.users, newUser]);
// await fs.writeFile(path.join(__dirname, '../model', 'users.json'), JSON.stringify(userDB.users));
// console.log(userDB.users);