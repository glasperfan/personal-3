const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NUMBER = { type: Number }
const STRING = { type: String }
const BOOLEAN = { type: Boolean }

const rideProductsModel = new Schema({
    upfront_fare_enabled: BOOLEAN,
    capacity: NUMBER,
    product_id: STRING,
    price_details: {
      service_fees: [
        {
          fee: NUMBER,
          name: STRING
        }
      ],
      cost_per_minute: NUMBER,
      distance_unit: STRING,
      minimum: NUMBER,
      cost_per_distance: NUMBER,
      base: NUMBER,
      cancellation_fee: NUMBER,
      currency_code: STRING
    },
    image: STRING,
    cash_enabled: BOOLEAN,
    shared: BOOLEAN,
    short_description: STRING,
    display_name: STRING,
    product_group: STRING,
    description: STRING
});

module.exports = mongoose.model('rideProducts', rideProductsModel);