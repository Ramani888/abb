import { Order } from "../models/order.model";
import { IOrder } from "../types/order";
import mongoose from "mongoose";

export const createOrderData = async (data: IOrder) => {
    try {
        const newData = new Order(data);
        await newData.save();
        return;
    } catch (error) {
        console.error('Error creating order data:', error);
        throw error;
    }
}

export const getOrderData = async (ownerId: string) => {
    try {
        const data = await Order.aggregate([
            {
                $match: {
                    ownerId: ownerId,
                    $or: [
                        { isDeleted: false },
                        { isDeleted: { $exists: false } }
                    ]
                }
            },
            // Convert customerId to ObjectId for lookup
            {
                $addFields: {
                    customerObjectId: {
                        $cond: [
                            { $regexMatch: { input: "$customerId", regex: /^[a-f\d]{24}$/i } },
                            { $toObjectId: "$customerId" },
                            null
                        ]
                    }
                }
            },
            // Lookup customer data
            {
                $lookup: {
                    from: "Customer",
                    localField: "customerObjectId",
                    foreignField: "_id",
                    as: "customerData"
                }
            },
            { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
            // Unwind products to process each order item
            { $unwind: { path: "$products", preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    "products.productObjectId": {
                        $cond: [
                            { $regexMatch: { input: "$products.productId", regex: /^[a-f\d]{24}$/i } },
                            { $toObjectId: "$products.productId" },
                            null
                        ]
                    },
                    "products.variantObjectId": {
                        $cond: [
                            { $regexMatch: { input: "$products.variantId", regex: /^[a-f\d]{24}$/i } },
                            { $toObjectId: "$products.variantId" },
                            null
                        ]
                    }
                }
            },
            // Lookup product
            {
                $lookup: {
                    from: "Product",
                    localField: "products.productObjectId",
                    foreignField: "_id",
                    as: "productData"
                }
            },
            {
                $addFields: {
                    "products.productData": { $arrayElemAt: ["$productData", 0] }
                }
            },
            // Extract the correct variant from productData.variants
            {
                $addFields: {
                    "products.variantData": {
                        $let: {
                            vars: {
                                variants: "$products.productData.variants"
                            },
                            in: {
                                $arrayElemAt: [
                                    {
                                        $filter: {
                                            input: "$$variants",
                                            as: "variant",
                                            cond: { $eq: ["$$variant._id", "$products.variantObjectId"] }
                                        }
                                    },
                                    0
                                ]
                            }
                        }
                    }
                }
            },
            // Group back to orders with products array
            {
                $group: {
                    _id: "$_id",
                    ownerId: { $first: "$ownerId" },
                    userId: { $first: "$userId" },
                    customerType: { $first: "$customerType" },
                    customerId: { $first: "$customerId" },
                    subTotal: { $first: "$subTotal" },
                    totalGst: { $first: "$totalGst" },
                    roundOff: { $first: "$roundOff" },
                    total: { $first: "$total" },
                    paymentMethod: { $first: "$paymentMethod" },
                    paymentStatus: { $first: "$paymentStatus" },
                    invoiceNumber: { $first: "$invoiceNumber" },
                    notes: { $first: "$notes" },
                    isDeleted: { $first: "$isDeleted" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    customerData: { $first: "$customerData" },
                    products: {
                        $push: {
                            productId: "$products.productId",
                            variantId: "$products.variantId",
                            unit: "$products.unit",
                            carton: "$products.carton",
                            quantity: "$products.quantity",
                            price: "$products.price",
                            gstRate: "$products.gstRate",
                            gstAmount: "$products.gstAmount",
                            total: "$products.total",
                            productData: "$products.productData",
                            variantData: "$products.variantData"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    ownerId: 1,
                    userId: 1,
                    customerType: 1,
                    customerId: 1,
                    subTotal: 1,
                    totalGst: 1,
                    roundOff: 1,
                    total: 1,
                    paymentMethod: 1,
                    paymentStatus: 1,
                    products: 1,
                    invoiceNumber: 1,
                    notes: 1,
                    isDeleted: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    customerData: 1
                }
            }
        ]);
        return data;
    } catch (error) {
        console.error('Error fetching order data:', error);
        throw error;
    }
}

export const updateOrderData = async (data: IOrder) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());
        const result = await Order.findByIdAndUpdate(documentId, data, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        console.error('Error updating order:', error);
        throw error;
    }
}

export const deleteOrderData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Order.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
}