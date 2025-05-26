const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename:{type:String},
    url:{type:String},    
  },
  category:{
    type:String,
    enum:["Trending","Rooms","City","Mountains","Castles","Amazing Pools","Camps","Farms","Arctic"],
  },
  price:{
    type: Number,
  },
  location: String,
  country: {
    type:String,
    match: [/^[A-Za-z\s]+$/, "Country name must only contain letters and spaces"]
  },
  // one-to many
  reviews: [
    {
      type:Schema.Types.ObjectId,
      ref:"Review",
    },
  ],
  owner:{
     type: Schema.Types.ObjectId,
      ref:"User",
  },
});

listingSchema.post("findOneAndDelete", async (listing)=>{
  if (listing){
    await Review.deleteMany({_id : {$in : listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;