const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapasync.js");

const {isLoggedIn,validateReview,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controller/review");

//create reviews 
router.post("/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview));

//destroyReview
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);
module.exports = router;