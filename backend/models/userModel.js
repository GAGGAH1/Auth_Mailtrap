const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  lastLogin:{
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpiresAt: {
    type: Date,
    default: null
  },
  verificationToken: {
    type: String,
    default: null
  },
    verificationTokenExpiresAt: {
        type: Date,
        default: null
    },

},{timestamps: true});

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;