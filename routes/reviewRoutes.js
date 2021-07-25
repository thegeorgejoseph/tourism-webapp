const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
const router = express.Router();

router.route('/getReviews').get(reviewController.getAllReviews);
router
  .route('/createReview')
  .post(authController.protect, reviewController.createReview);

module.exports = router;
