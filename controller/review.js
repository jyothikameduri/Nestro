const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async(req,res)=>{
  //req.params.id is undefined inside review.js
  //this is because nested :params dont automatically propagate when using express.Router
  //unless we explictly tell it to merge the parameters from parent route.
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  console.log(newReview.author);
  listing.reviews.push(newReview);
  newReview.listing = listing._id;

  await newReview.save();
  await listing.save();
  req.flash("success","Thank you for your review !");
  console.log("new review saved");
  res.redirect(`/listings/${req.params.id}`);
};

module.exports.destroyReview = async (req,res) =>{
    let {id,reviewId} = req.params;
    // $pull - removes from an existing array all instances of a value or values that match a specified condition
    await Listing.findByIdAndUpdate(id,{$pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted !");
    res.redirect(`/listings/${id}`);
};