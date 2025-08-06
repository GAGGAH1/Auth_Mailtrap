const express = require('express');
const router = express.Router();
const { registerUser, login, logout, forgotPassword, resetPassword, verifyEmail, checkAuth } = require('../controllers/authController');
const protectRoute  = require('../middlewares/protectRoute');


router.get("/check-auth", protectRoute, checkAuth);

// Route for user registration
router.post('/register', registerUser);
// Route for user login
router.post('/login', login);
// Route for user logout
router.post('/logout', logout);


// Route for email verification
router.post('/verify-email', verifyEmail);
// Route for forgot password
router.post('/forgot-password', forgotPassword);


// Route for resetting password
router.post('/reset-password/:token', resetPassword);




module.exports = router;