import mongoose, { Schema } from "mongoose";

const env = process.env;

const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const Role = dbConnection.model('Role', RoleSchema, 'Role');