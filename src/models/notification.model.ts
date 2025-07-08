import mongoose, { Schema } from "mongoose";

const env = process.env;

const NotificationSchema = new Schema({
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
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['order', 'stock', 'payment', 'system']
    },
    link: {
        type: String,
        required: false,
        default: ''
    },
    captureDate: {
        type: Date,
        required: false,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        required: false,
        default: false
    },
    isDeleted: {
        type: Boolean,
        required: false,
        default: false
    }
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const Notification = dbConnection.model('Notification', NotificationSchema, 'Notification');