const Listing = require("../models/listing");
const mongoose = require("mongoose");

module.exports.index = async (req, res) => {
  const { category } = req.query;
  let allListings;

  if (category) {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index", { allListings });
};

module.exports.new = (req, res) => {
  res.render("listings/new");
};

module.exports.show = async (req, res) => {
  let { id } = req.params;
  //if the length of the id is changed or if id is not in mongoose form
  if (!mongoose.Types.ObjectId.isValid(id)) {
    // throw new ExpressError(400, "Invalid Listing ID");
    req.flash("error","The requested listing was not found.");
    return res.redirect("/listings");
  }
  //according to the schema we are populating the reviews so as to fetch the related document in a single query.
  //populate works only when there is a defined relationship between two collections.
  const listing = await Listing.findById(id)
  .populate({
    path:"reviews",
    populate:{
      path:"author",
    },
  }).populate("owner");
  //if the  given listing id is not available
  if (!listing) {
    //throw new ExpressError(404, "Listing not found");
    //ucan also use flash instead of expressError class
    req.flash("error","The requested listing was not found.");
    return res.redirect("/listings");
  
  }
  res.render("listings/show", { listing });
};

module.exports.create = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id ;
    newListing.image = {url,filename};
    newListing.category = req.body.listing.category;
    await newListing.save();
    req.flash("success","Listing is created !!");
    res.redirect("/listings");
};

module.exports.update = async (req, res) => {
  let { id } = req.params; 
  let listing = await Listing.findByIdAndUpdate(id, req.body.listing, {
    runValidators: true,
    new: true
  });
    if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    listing.category = req.body.listing.category;
    await listing.save();
  }
  req.flash("success","Your listing has been updated !!");
  res.redirect(`/listings/${id}`);
};

module.exports.edit = async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error","The requested listing was not found.");
    return res.redirect("/listings");
    //throw new ExpressError(400, "Invalid Listing ID"); this is custom class , it is used when u want to handle errors for each field
  }
  const listing = await Listing.findById(id);
  if (!listing) {
    //ucan also use flash instead of expressError class
    req.flash("error","The requested listing was not found.");
    return res.redirect("/listings");
  }
  res.render("listings/edit", { listing });
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success","Listing is deleted !!");
  res.redirect("/listings");
};