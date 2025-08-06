const jwt = require('jsonwebtoken');


const generateTokenAndSetCookie = (userId, res) => {
  // Generate JWT token
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set cookie with token
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'Strict' // Prevent CSRF attacks
  });

  return token;
}

module.exports = { generateTokenAndSetCookie };
// This function generates a JWT token for the user and sets it as an HTTP-only cookie in