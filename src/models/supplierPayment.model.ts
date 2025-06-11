import mongoose, { Schema } from "mongoose";

const env = process.env;

const SupplierPaymentSchema = new Schema({
    ownerId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    supplierId: {
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
export const SupplierPayment = dbConnection.model('SupplierPayment', SupplierPaymentSchema, 'SupplierPayment');