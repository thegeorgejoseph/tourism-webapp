const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// router.param('id', tourController.checkID);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.deleteTour
  );

router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrict('user'),
    reviewController.createReview
  );

module.exports = router;
