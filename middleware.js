const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/expresserror.js");
const { listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // req.session.redirectUrl = req.originalUrl;
    if (req.method === "GET") {
      // ✅ Safe to remember
      req.session.redirectUrl = req.originalUrl;
    } else if (req.method === "POST" || req.method === "DELETE") {
      // ✅ Manually redirect to the SHOW page of the listing
      const listingId = req.params.id; // This works if your route contains :id
      if (listingId) {
        req.session.redirectUrl = `/listings/${listingId}`;
      } else {
        req.session.redirectUrl = "/listings"; // fallback
      }
    }

    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};


module.exports.saveRedirectUrl = (req,res,next)=>{
    // we get redirectedUrl undefined because when passport makes the user login successfully then passport by default sets the req.session and deletes the extra info stored in session
    // as the locals can access anywhere and passport can not have access to delete from the locals
    console.log("Redirect URL in session:", req.session.redirectUrl); // Debug log
    if (req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
        
    }
    next();
};

module.exports.isOwner = async(req,res,next)=>{
  let { id } = req.params; 
  let listing = await Listing.findById(id);
  if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash("error","You dont have permissions to access");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req,res,next)=>{
    // we are extracting the error and value as this error is in the form error : value
    console.log("Request body:", req.body);
    const { error} = listingSchema.validate(req.body);
    if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(400,msg);
    }
    else{
      next();
    }
};

module.exports.validateReview = (req,res,next)=>{
    // we are extracting the error and value as this error is in the form error : value
    let { error} = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400,errMsg);
    }
    else{
      next();
    }
};

module.exports.isReviewAuthor = async (req,res,next)=>{
  let { id,reviewId } = req.params; 
  let review = await Review.findById(reviewId);
  if(!review.author._id.equals(res.locals.currUser._id)){
    req.flash("error","You dont have permissions to access");
    return res.redirect(`/listings/${id}`);
  }
  next();
};