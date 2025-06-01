import mongoose, { Schema } from "mongoose";

const env = process.env;

const ProductSchema = new Schema({
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
    categoryId: {
        type: String,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    variants: [
        {
            packingSize: {
                type: String,
                required: true,
            },
            sku: {
                type: String,
                required: true,
            },
            barcode: {
                type: String,
                required: true,
            },
            retailPrice: {
                type: Number,
                required: true,
            },
            wholesalePrice: {
                type: Number,
                required: true,
            },
            purchasePrice: {
                type: Number,
                required: true,
            },
            minStockLevel: {
                type: Number,
                required: true,
            },
            taxRate: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            }
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    captureDate: {
        type: Date,
        required: false,
        default: Date.now
    },
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const Product = dbConnection.model('Product', ProductSchema, 'Product');