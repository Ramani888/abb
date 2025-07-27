import mongoose, { Schema } from "mongoose";

const env = process.env;

const PurchaseOrderSchema = new Schema({
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
    subTotal: {
        type: Number,
        required: true,
    },
    totalGst: {
        type: Number,
        required: true,
    },
    roundOff: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: false,
    },
    paymentStatus: {
        type: String,
        required: true,
    },
    products: [{
        productId: {
            type: String,
            required: true,
        },
        variantId: {
            type: String,
            required: true,
        },
        unit: {
            type: Number,
            required: true,
            min: 1,
        },
        carton: {
            type: Number,
            required: true,
            min: 1,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        mrp: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        gstRate: {
            type: Number,
            required: true,
        },
        gstAmount: {
            type: Number,
            required: true,
        },
        total: {
            type: Number,
            required: true,
        }
    }],
    invoiceNumber: {
        type: String,
        required: true,
    },
    notes: {
        type: String
    },
    // Extra payment fields according to payment method
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
    isDeleted: {
        type: Boolean,
        default: false
    },
    captureDate: {
        type: Date,
        required: false,
        default: Date.now
    },
}, {timestamps: true});

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const PurchaseOrder = dbConnection.model('PurchaseOrder', PurchaseOrderSchema, 'PurchaseOrder');