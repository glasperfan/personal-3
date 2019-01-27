import { Schema, model, Model, Document, HookNextFunction } from "mongoose";
import { STRING, NUMBER } from "./types";

export interface IRide extends Document {
    request_id?: string;
    request_time?: number;
    start_time?: number;
    start_city: {
        display_name?: string;
        latitude?: string;
        longitude?: string;
    },
    product_id?: string;
    status?: string;
    distance?: number;
    end_time?: number;
    title?: string;
    author?: string;
    user_id?: string;
}

const rideModel: Schema = new Schema({
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

const validateRide = (next: HookNextFunction, docs: IRide[]) => validateThenNext(validateRideFn, next, docs);

const validateRideFn = (ride: IRide) => {
    if (!ride.product_id) {
        console.log(`Ride id ${ride.request_id} has no product_id`);
    }
    if (!ride.user_id) {
        throw new Error('user_id required');
    }
}

const validateThenNext = <T extends Document>(validateFn: (doc: T) => void, next: HookNextFunction, docs: T[]): void => {
    docs.map(validateFn);
    next();
}

// Log any missing 
rideModel.pre('insertMany', validateRide);

export const Ride: Model<IRide> = model<IRide>('rides', rideModel);