const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    geocodedLocationName: { type: String, required: true },
    reverseGeocodeAddress: String,
    collectiveRating: Number,
    numOfUserRating: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model('GlobalLocation', schema);
