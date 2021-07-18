const Tour = require('../models/tourModels');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
const tours = []; //temp
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  if (parseInt(req.params.id, 10) > tours.length) {
    return res.status(404).json({ status: 'failed', message: 'invalid ID' });
  }
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const exclude = ['page', 'sort', 'limit', 'fields'];
    const queryObj = { ...req.query };
    exclude.forEach((val) => delete queryObj[val]);
    // console.log(req.query, queryObj);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    console.log(req.query);
    let query = Tour.find(JSON.parse(queryStr));
    if (req.query.sort) {
      const sorter = req.query.sort.split(',').join(' ');
      query = query.sort(sorter);
    } else {
      query = query.sort('-createdAt');
    }
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip > numTours) throw new Error('Page does not exist!');
    }
    query = query.skip(skip).limit(limit);

    const tours = await query;
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours: tours },
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save()
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    res.status(400).json({ status: 'failed', message: err });
  }
};

exports.getTour = async (req, res) => {
  try {
    // const id = req.params.id
    const tour = await Tour.findById({ id: req.params.id });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'failed', message: err });
  }
};
exports.patchTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    console.log(tour);
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      staus: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({ status: 'failed', message: err });
  }
};
