const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = require('./User')
const GlobalLocation = require('./GlobalLocation')

const schema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        validate: {
            validator: function (userId) {
                return User.findById(userId)
            },
            message: "Invalid user!"
        }
    },
    globalLocation: {
        type: Schema.Types.ObjectId,
        ref: "GlobalLocation",
        required: true,
        validate: {
            validator: function (locationId) {
                return GlobalLocation.findById(locationId)
            },
            message: "Invalid Location!"
        }
    },
    isPublic: {type:Boolean, default: false},
    locationName: { type: String, required: true },
    userRating: Number,
    userFeedback: [String]
},
    { timestamps: true }

);

module.exports = mongoose.model('UserLocation', schema);