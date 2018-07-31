const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = Schema({
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    name: {type: String, required: true},
    reverseGeocodeAddress: String,
    collectiveRating: Number,
    numOfUserRating: Number,

});

module.exports = mongoose.model('GlobalLocation', schema);