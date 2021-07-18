const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must have name'],
    unique: true,
    trim: true,
  },
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
  },
  ratingsAverage: { type: Number, default: 4.5 },
  ratingsQuantity: { type: Number, default: 0 },
  price: { type: Number, required: [true, 'Must have price'] },
  discount: Number,
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
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
