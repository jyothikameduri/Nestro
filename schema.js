const Joi = require('joi');

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string()
      .valid("Trending", "Rooms", "City", "Mountains", "Castles", "Amazing Pools", "Camps", "Farms", "Arctic")
      .required(),
    price: Joi.number().required().min(1),
    location: Joi.string().required(),
    country: Joi.string().required(),
  }).required()
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating:Joi.number().optional(),
    comment:Joi.string().optional()
  })
});
module.exports = { listingSchema, reviewSchema };