const mongoose = require('mongoose');
const User = require('./userModel');
const Tour = require('./tourModels');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: { type: Date, default: Date.now() },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a User'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  } // virtual options show the properties that are created during runtime by code to show up in the response rather than just the schema ones!
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  // }).populate({
  //   path: 'user',
  // });
  //turning populate of tour off because of virtual populate on tour makes the response too big
  this.populate({
    path: 'user',
  });
  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
