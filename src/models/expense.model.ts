import mongoose, { Schema } from "mongoose";

const env = process.env;

const ExpenseSchema = new Schema({
    ownerId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    paymentMode: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
    },
    captureDate: {
        type: Date,
        default: Date.now,
    }
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const Expense = dbConnection.model('Expense', ExpenseSchema, 'Expense');