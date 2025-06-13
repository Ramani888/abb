import mongoose, { Schema } from "mongoose";

const env = process.env;

const CustomerSchema = new Schema({
    ownerId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
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
    gstNumber: {
        type: String
    },
    creditLimit: {
        type: Number
    },
    paymentTerms: {
        type: String
    },
    captureDate: {
        type: Date,
        required: false,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        required: false,
        default: false
    }
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const Customer = dbConnection.model('Customer', CustomerSchema, 'Customer');