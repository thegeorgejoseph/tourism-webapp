const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  //   const newUser = await User.create({
  //     // important to specify exactly what you need to create so that people dont abuse the functionality and cause security flaws
  //     name: req.body.name,
  //     email: req.body.email,
  //     password: req.body.password,
  //     passwordConfirm: req.body.passwordConfirm,
  //   });
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    next(new AppError('User does not exist', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with new password! and
  passwordConfirm to ${resetURL}.\n Ignore otherwise!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your token is valid for 10 minutes',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpired = undefined;
    user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending the email, try again later', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex'); // since the route has /:token it can be accessed using req.params

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpired: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token has expired or is invalid', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;
  await user.save(); // now we want to run validators so dont mention validateBeforeSave

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  // console.log(user);
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  console.log('here');
  createSendToken(user, 200, res);
});
