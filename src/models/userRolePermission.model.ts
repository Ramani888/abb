import mongoose, { Schema } from "mongoose";

const env = process.env;

const UserRolePermissionSchema = new Schema({
    ownerId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    roleId: {
        type: String,
        required: true,
    },
    permissionId: {
        type: String,
        required: true,
    }
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const UserRolePermission = dbConnection.model('UserRolePermission', UserRolePermissionSchema, 'UserRolePermission');