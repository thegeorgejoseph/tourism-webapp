const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Must have name'],
      unique: true,
      trim: true,
      maxlength: [40, 'tour must have at most 40 chars'],
      minlength: [10, 'tour must have at least 10 chars'],
      // validate: [validator.isAlpha, 'Must be Alphabets only'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Must have Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'must be easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'must be above 1'],
      max: [5, 'must be less than 5'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'Must have price'] },
    discount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Must have summary'],
    },
    description: { type: String, trim: true },
    imageCover: { type: String, required: [true, 'Must have cover image'] },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document middleware that runs before .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
  this.start = Date.now();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

//aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
