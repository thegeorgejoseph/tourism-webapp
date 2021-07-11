const express = require('express');
const fs = require('fs');
const app = express();
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

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
