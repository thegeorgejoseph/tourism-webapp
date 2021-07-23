const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
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
  },
  passwordConfirm: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
