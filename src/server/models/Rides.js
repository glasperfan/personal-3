const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const rideModel = new Schema({
    request_id: { type: String },
    request_time: { type: Number },
    start_time: { type: Number },
    start_city: {
        display_name: { type: String },
        latitude: { type: String },
        longitude: { type: String },
    },
    product_id: { type: String },
    status: { type: String },
    distance: { type: Number },
    end_time: { type: Number },
    title: { type: String },
    author: { type: String },
    user_id: { type: String }
});

module.exports = mongoose.model('rides', rideModel);