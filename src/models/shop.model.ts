import mongoose, { Schema } from "mongoose";

const env = process.env;

const ShopSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    gst: {
        type: String,
        required: true,
    },
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const Shop = dbConnection.model('Shop', ShopSchema, 'Shop');