import mongoose, { Schema } from "mongoose";

const env = process.env;

const StockLogSchema = new Schema(
  {
    ownerId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    variantId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "purchase",
        "sale",
        "return",
        "adjustment",
        "delete_purchase",
        "delete_sale",
        "update_purchase",
        "update_sale",
      ],
      required: true,
    },
    quantity: {
      type: Number, // +ve for add, -ve for subtract
      required: true,
    },
    balanceAfter: {
      type: Number, // stock level after this change
      required: true,
    },
    note: {
      type: String,
    },
    captureDate: {
        type: Date,
        default: Date.now, // capture date of the stock log
    }
  },
  { timestamps: true }
);

const dbConnection = mongoose.connection.useDb(env.MONGODB_DATABASE ?? '');
export const StockLog = dbConnection.model('StockLog', StockLogSchema, 'StockLog');
