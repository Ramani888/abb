import mongoose, { Schema } from "mongoose";

const env = process.env;

const PermissionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const Permission = dbConnection.model('Permission', PermissionSchema, 'Permission');