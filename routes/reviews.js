const express = require('express');
const router = express.Router({mergeParams: true});//和app.js中的前缀参数（含id）合并，使得能访问id。campground.js不用做此处理因为其id都在campgrounds.js文件中
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');


router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
