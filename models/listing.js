const mongoose = require("mongoose");

const Review = require("./review.js");

const Schema = mongoose.Schema;

const listingSchema = new Schema({

  title: {
    type: String,
    required: true,
  },

  description: String,

  image: {
    url: String,
    filename: String,
  },

  price: Number,

  location: String,

  country: String,

  // Coordinates for Map
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },

    coordinates: {
      type: [Number],
      required: true,
    },
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

});


// Delete reviews when listing is deleted
listingSchema.post(
  "findOneAndDelete",
  async (listing) => {

    if (listing) {

      await Review.deleteMany({
        _id: {
          $in: listing.reviews,
        },
      });

    }

  }
);


const Listing = mongoose.model(
  "Listing",
  listingSchema
);

module.exports = Listing;