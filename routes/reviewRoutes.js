const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // very useful because any router that is linked the reviewRouter this router will have access to it :)
// this means that POST tours/tourID/reviews will now get re routed here automatically and get called on the POST

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrict('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrict('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrict('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
