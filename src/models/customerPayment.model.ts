import mongoose, { Schema } from "mongoose";

const env = process.env;

const CustomerPaymentSchema = new Schema({
    ownerId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    customerId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentType: {
        type: String,
        required: true,
    },
    paymentMode: {
        type: String,
        required: true,
    },
    cardNumber: {
        type: String,
        required: false,
    },
    upiTransactionId: {
        type: String,
        required: false,
    },
    chequeNumber: {
        type: String,
        required: false,
    },
    gatewayTransactionId: {
        type: String,
        required: false,
    },
    bankReferenceNumber: {
        type: String,
        required: false,
    },
    captureDate: {
        type: Date,
        required: false,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const CustomerPayment = dbConnection.model('CustomerPayment', CustomerPaymentSchema, 'CustomerPayment');