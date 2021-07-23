const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  passwordChangedAt: { type: Date },
  name: { type: String, required: [true, 'Users need a name!'] },
  email: {
    type: String,
    required: [true, 'User needs an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Enter valid email'],
  },
  photo: String,
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
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  // instance methods are available on all documents present in a collection
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  console.log(this);
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
const User = mongoose.model('User', userSchema);

module.exports = User;
