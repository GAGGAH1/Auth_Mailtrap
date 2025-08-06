const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { generateTokenAndSetCookie } = require('../utils/generateTokenAndSetCookie');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../mailtrap/email');
const crypto = require('crypto');


// Function to register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({success:false,message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
    // Create a new user
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Token valid for 24 hours
    });

    // Save the user to the database
    await newUser.save();
    generateTokenAndSetCookie(newUser._id, res);

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: newUser,
  });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({success:false, message: 'Internal server error' });
  }
}

const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    
    // Find the user by email
    const user = await userModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: new Date() } // Check if the token is still valid
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Check if the verification token matches and is not expired
    if (user.verificationToken !== verificationToken || new Date() > user.verificationTokenExpiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined; // Clear the token after successful verification
    user.verificationTokenExpiresAt = undefined; // Clear the expiration date
    await user.save();

    await sendWelcomeEmail(user.email, user.username);

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const login = async (req, res) => {
 const { email, password } = req.body;
  try { 
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid Credentials' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Check if the user is verified
    // if (!user.isVerified) {
    //   return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
    // }

    // Generate token and set cookie
    generateTokenAndSetCookie(user._id, res);

    user.lastLogin = new Date(); // Update last login time
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: user,
    });
    
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const logout = async (req, res) => {
    // Clear the cookie to log out the user
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
}

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Validate input
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Find the user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate a password reset token
    // const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
    // user.passwordResetToken = resetToken;
    // user.passwordResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // Token valid for 15 minutes

    //Generate a secure random token
    const resetToken = crypto.randomBytes(20).toString('hex'); // Generate a secure random token
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // Token valid for 1 day
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt; // Set expiration time for the token

    await user.save();

    // Send the password reset email
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`);

    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }

    // Find the user by reset token
    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() } // Check if the token is still valid
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password and clear the reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    // Optionally, you can send a confirmation email or message
    await sendResetSuccessEmail(user.email);

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  } 


}


const checkAuth = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('-password ');
    // Check if user exists
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error checking authentication:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
module.exports = {
  registerUser,
  verifyEmail,
  logout,
  login,
  forgotPassword,
  resetPassword,
  checkAuth
}