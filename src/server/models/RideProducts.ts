import { Schema, model, Model, Document } from "mongoose";
import { BOOLEAN, STRING, NUMBER } from './types';

export interface IRideProduct extends Document {
  upfront_fare_enabled: boolean;
  capacity: number;
  product_id: string;
  price_details: {
    service_fees: { fee: number; name: string }[];
    cost_per_minute: number;
    distance_unit: string;
    minimum: number;
    cost_per_distance: number;
    base: number;
    cancellation_fee: number;
    currency_code: string;
  };
  image: string;
  cash_enabled: boolean;
  shared: boolean;
  short_description: string;
  display_name: string;
  product_group: string;
  description: string;
  is_valid: boolean;
}

const rideProductsModel: Schema = new Schema({
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
    description: STRING,
    is_valid: BOOLEAN
});

rideProductsModel.pre('validate', (next) => {
  this.is_valid = !!this.product_id;
  next();
});

export const RideProduct: Model<IRideProduct> = model<IRideProduct>('rideProducts', rideProductsModel);

export const UnavailableRideProduct: IRideProduct = new RideProduct({});