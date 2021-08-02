const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Users need a name!'] },
  email: {
    type: String,
    required: [true, 'User needs an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Enter valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must atleast have 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'confirm your password'],
    validate: {
      // only works on CREATE or SAVE
      validator: function (val) {
        return this.password === val;
      },
      message: 'passwords should match',
    },
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: String,
  passwordResetExpired: Date,
  active: { type: Boolean, default: true, select: false },
});

//validate and .pre middlewares only work on CREATE and SAVE, so don't use findbyIdAndUpdate for password related stuff. save manually
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
}); //QueryMiddleware that executes before any query function that starts with Find, findAndUpdate etc.

userSchema.methods.correctPassword = async function (
  // instance methods are available on all documents present in a collection
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // console.log(this);
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(this.passwordChangedAt, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // 100 < 200
  }
  return false; // did not change
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpired = Date.now() + 10 * 60 * 1000;
  // console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
