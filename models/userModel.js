const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter the username"]
    },
    email: {
      type: String,
      required: [true, "Please enter the Email"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email address"]
    },
    password: {
      type: String,
      required: [true, "Please enter the Password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false
    },
    avatar: {
      type: String
    },
    role: {
      type: String,
      default: "user"
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

// Hash the password before saving the user (only if the password has been modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate a JWT token for the user
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME || '7d'
  });
};

// Check if the entered password matches the hashed password
userSchema.methods.isValidPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate a password reset token
userSchema.methods.getResetToken = function () {
  // Generate a token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the token and set it to the resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set token expiry time (30 minutes)
  this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
