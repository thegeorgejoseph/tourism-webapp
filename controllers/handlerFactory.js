const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//Using closures to create factory model
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No tour found with that Id', 404));
    }
    res.status(204).json({
      staus: 'success',
      data: null,
    });
  });
