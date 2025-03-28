import mongoose, { Schema } from "mongoose";

const env = process.env;

const CustomerSchema = new Schema({
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
    customerType: {
        type: String,
        required: true,
    },
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const Customer = dbConnection.model('Customer', CustomerSchema, 'Customer');