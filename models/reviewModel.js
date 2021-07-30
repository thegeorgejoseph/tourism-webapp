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

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // post middleware has no access to next
  this.constructor.calcAverageRatings(this.tour); // need to use constructor because we need to access the model but the model is defined below and cannot be called before
});

//the next two steps is the only way to appy it to a query string
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // query middleware has access to the query string and not the document itseld so we have to exec it
  this.r = await this.findOne();
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
