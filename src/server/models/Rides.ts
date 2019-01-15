import { Schema, model } from "mongoose";

const rideModel = new Schema({
    request_id: STRING,
    request_time: NUMBER,
    start_time: NUMBER,
    start_city: {
        display_name: STRING,
        latitude: STRING,
        longitude: STRING,
    },
    product_id: STRING,
    status: STRING,
    distance: NUMBER,
    end_time: NUMBER,
    title: STRING,
    author: STRING,
    user_id: STRING
});

export default model('rides', rideModel);