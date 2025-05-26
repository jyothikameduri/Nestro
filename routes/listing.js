const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync.js");
const { isLoggedIn,isOwner,validateListing  } = require("../middleware.js");
const multer  = require('multer');
const {storage} = require("../cloudconfig.js");
//const upload = multer({ dest: 'uploads/' }); -> files was stored in a uploads
const upload = multer({ storage}); // files are stored in a cloud 

const listingController = require("../controller/listing");

//router.route() - combines all the same routes into one , so as to make code look clean .

router
  .route("/")
  .get(wrapAsync(listingController.index))//index route
  .post(
    isLoggedIn,
    //make sure the correct order of middleware while using multer because the image comes from req.file not from req.body . 
    //if u use upload.single("listing[image]") after validateListing , then u will get ('listing' not found) as it is validating the empty field which is req.body(because image is in req.file)
    upload.single("listing[image]"),
    validateListing,
    wrapAsync (listingController.create));//create route

// NEW route
router.get("/new",isLoggedIn,listingController.new);

router 
  .route("/:id")
  .get(wrapAsync(listingController.show)) // SHOW route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.update))// UPDATE route
  .delete(
    isLoggedIn,
    wrapAsync (listingController.delete));// DELETE route

// EDIT route
router.get("/:id/edit", 
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.edit));

module.exports = router ;