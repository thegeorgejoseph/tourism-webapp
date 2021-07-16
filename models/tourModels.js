const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Must have name'], unique: true },
  rating: Number,
  price: { type: Number, required: [true, 'Must have price'] },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
