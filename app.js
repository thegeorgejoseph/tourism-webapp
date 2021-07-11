const { ESRCH } = require('constants');
const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
const port = 3000;

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours: tours },
  });
});

app.get('/api/v1/tours/:id', (req, res) => {
  const tour = tours.find((el) => el.id === parseInt(req.params.id));
  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
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
});
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
