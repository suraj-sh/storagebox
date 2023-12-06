const User = require('../model/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const handleNewUser = [
  body('user', 'Enter a valid name').isLength({ min: 6 }),
  body('email', 'Enter a valid email').isEmail(),
  body('pwd', 'Enter at least one alphabet and one number').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user, pwd, email } = req.body;
    if (!user || !pwd || !email) return res.status(400).json({ 'message': 'Username, email, and password are required' });

    try {
      const duplicate = await User.findOne({ username: user }).exec();
      if (duplicate) return res.status(409).json({ 'message': 'Username already exists' });

      const userEmail = await User.findOne({ email: email });
      if (userEmail) return res.status(400).json({ 'message': 'Email already exists' });

      const hashedPwd = await bcrypt.hash(pwd, 10);

      const result = await User.create({
        "username": user,
        "email": email,
        "password": hashedPwd
      });
      // const data={
      //   result:{
      //     id:result.id
      //   }
      // }
      console.log(result);
      // Check if 'success' is defined before sending it in the response
      const responseObj = {};
      if (result) {
        responseObj.success = `New user ${user} created!`;
      } else {
        responseObj.message = 'Failed to create a new user';
      }

      res.status(200).json(responseObj);
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