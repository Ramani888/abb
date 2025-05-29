import mongoose, { Schema } from "mongoose";

const env = process.env;

const SupplierSchema = new Schema({
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
    number: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    gstNumber: {
        type: String,
        required: false
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
export const Supplier = dbConnection.model('Supplier', SupplierSchema, 'Supplier');