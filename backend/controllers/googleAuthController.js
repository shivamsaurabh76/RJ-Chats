const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        pic: picture,
        password: email + process.env.JWT_SECRET, // Create a secure password
        isEmailVerified: true, // Since Google has verified the email
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({
      message: 'Invalid Google token or authentication failed',
      error: error.message,
    });
  }
};

module.exports = { googleAuth };