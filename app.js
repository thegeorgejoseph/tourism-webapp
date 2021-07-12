const { ESRCH } = require('constants');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

app.use(morgan('dev'));

app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours: tours },
  });
};

const getTour = (req, res) => {
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

const postAllTours = (req, res) => {
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

const patchTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'UpdatedTourGoesHere',
    },
  });
};

const deleteTour = (req, res) => {
  if (parseInt(req.params.id) > tours.length) {
    return res.status(404).json({ status: 'failed', message: 'invalid ID' });
  }
  res.status(204).json({
    staus: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const tourRouter = express.Router();
tourRouter.route('/').get(getAllTours).post(postAllTours);
tourRouter.route('/:id').get(getTour).patch(patchTour).delete(deleteTour);

const userRouter = express.Router();
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
