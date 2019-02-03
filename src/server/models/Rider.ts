import { Schema, model, Model, Document, HookNextFunction } from "mongoose";
import { STRING, BOOLEAN, NUMBER } from "./types";

export interface IRider extends Document {
    picture: string;
    first_name: string;
    last_name: string;
    uuid: string;
    rider_id: string;
    email: string;
    mobile_verified: boolean;
    promo_code: string;
}

const riderModel: Schema = new Schema({
    picture: STRING,
    first_name: STRING,
    last_name: STRING,
    uuid: STRING,
    rider_id: STRING,
    email: STRING,
    mobile_verified: BOOLEAN,
    promo_code: STRING,
    placement: NUMBER
});

export const Rider: Model<IRider> = model<IRider>('riders', riderModel);