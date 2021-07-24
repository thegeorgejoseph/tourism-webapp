const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  //   const newUser = await User.create({
  //     // important to specify exactly what you need to create so that people dont abuse the functionality and cause security flaws
  //     name: req.body.name,
  //     email: req.body.email,
  //     password: req.body.password,
  //     passwordConfirm: req.body.passwordConfirm,
  //   });
  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: { user: newUser },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //   console.log(email, password);
  if (!email || !password) {
    return next(new AppError('Please provide email and password'));
  }
  const user = await User.findOne({ email }).select('+password'); // password select was set to false so we need to explicitly show it here
  //   console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = signToken(user._id);
  //   console.log(token);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; // cannot access token outside if you define it as const inside
  }
  if (!token) {
    return next(new AppError('You are not logged in to gain access', 401));
  }

  //verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //   console.log(decoded);
  const freshUser = await User.findById(decoded.id); // checking if User still exists
  if (!freshUser) {
    return next(
      new AppError('The user belonging to the token no longer exists', 401)
    );
  }
  if (freshUser.changedPasswordAfter(decoded.iat))
    return next(new AppError('User recently changed password', 401));

  //grant access to protected route
  req.user = freshUser;
  next();
});

//middlewares cannot have parameters so we use closures to pass it down
exports.restrict =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have permission to perform this action!', 403)
      );
    }
    next();
  };
