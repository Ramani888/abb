import mongoose, { Schema } from "mongoose";

const env = process.env;

const ShopSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    number: { type: Number, required: true },
    email: { type: String, required: true },
    gst: { type: String, required: true },
});

const OwnerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    shop: ShopSchema,

}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const Owner = dbConnection.model('Owner', OwnerSchema, 'Owner');