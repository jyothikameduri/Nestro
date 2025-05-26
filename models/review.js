const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,
    rating:{
        type: Number,
        min:1,
        max:5,
    },
    //i have done a two-way referencing , 
    // because when i make a review to specific id , it should get refer to the particular listing . 
    // in this way we can disable the submit button after first click.
    //to prevent accidental duplication on backend-side
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
