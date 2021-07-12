const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours: tours },
  });
};

exports.getTour = (req, res) => {
  const id = parseInt(req.params.id);
  const tour = tours.find((el) => el.id === id);
  if (!tour) {
    return res.status(404).json({ status: 'failed', message: 'Invalid ID' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.postAllTours = (req, res) => {
  //   console.log(req.body);
  newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        throw err;
      }
      res.status(201).json({
        status: 'success',
        result: tours.length,
        data: {
          tours,
        },
      });
    }
  );
};

exports.patchTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'UpdatedTourGoesHere',
    },
  });
};

exports.deleteTour = (req, res) => {
  if (parseInt(req.params.id) > tours.length) {
    return res.status(404).json({ status: 'failed', message: 'invalid ID' });
  }
  res.status(204).json({
    staus: 'success',
    data: null,
  });
};
