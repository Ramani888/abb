import mongoose, { Schema } from "mongoose";

const env = process.env;

const UserSchema = new Schema({
    ownerId: {
        type: String,
        required: true,
    },
    name: {
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
    password: {
        type: String,
        required: true,
    },
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const User = dbConnection.model('User', UserSchema, 'User');