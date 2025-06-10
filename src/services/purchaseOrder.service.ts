import { PurchaseOrder } from "../models/purchaseOrder.model";
import { IPurchaseOrder } from "../types/purchaseOrder";
import mongoose from "mongoose";

export const createPurchaseOrderData = async (data: IPurchaseOrder) => {
    try {
        const newData = new PurchaseOrder(data);
        await newData.save();
        return;
    } catch (error) {
        console.error('Error creating purchase order data:', error);
        throw error;
    }
}

export const getPurchaseOrderData = async (ownerId: string) => {
    try {
        const data = await PurchaseOrder.aggregate([
            {
                $match: {
                    ownerId: ownerId,
                    $or: [
                        { isDeleted: false },
                        { isDeleted: { $exists: false } }
                    ]
                }
            },
            // Convert supplierId to ObjectId for lookup
            {
                $addFields: {
                    supplierObjectId: {
                        $cond: [
                            { $regexMatch: { input: "$supplierId", regex: /^[a-f\d]{24}$/i } },
                            { $toObjectId: "$supplierId" },
                            null
                        ]
                    }
                }
            },
            // Lookup supplier data
            {
                $lookup: {
                    from: "Supplier",
                    localField: "supplierObjectId",
                    foreignField: "_id",
                    as: "supplierData"
                }
            },
            { $unwind: { path: "$supplierData", preserveNullAndEmptyArrays: true } },
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
                    supplierId: { $first: "$supplierId" },
                    subTotal: { $first: "$subTotal" },
                    totalGst: { $first: "$totalGst" },
                    roundOff: { $first: "$roundOff" },
                    total: { $first: "$total" },
                    paymentMethod: { $first: "$paymentMethod" },
                    paymentStatus: { $first: "$paymentStatus" },
                    invoiceNumber: { $first: "$invoiceNumber" },
                    notes: { $first: "$notes" },
                    isDeleted: { $first: "$isDeleted" },
                    captureDate: { $first: "$captureDate" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    supplierData: { $first: "$supplierData" },
                    products: {
                        $push: {
                            productId: "$products.productId",
                            variantId: "$products.variantId",
                            unit: "$products.unit",
                            carton: "$products.carton",
                            quantity: "$products.quantity",
                            mrp: "$products.mrp",
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
                    supplierId: 1,
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
                    captureDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    supplierData: 1
                }
            }
        ]);
        return data;
    } catch (error) {
        console.error('Error fetching purchase order data:', error);
        throw error;
    }
}

export const updatePurchaseOrderData = async (data: IPurchaseOrder) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());
        const result = await PurchaseOrder.findByIdAndUpdate(documentId, data, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        console.error('Error updating purchase order:', error);
        throw error;
    }
}

export const deletePurchaseOrderData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await PurchaseOrder.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        console.error('Error deleting purchase order:', error);
        throw error;
    }
}

export const getAllPurchaseOrderDataBySupplierId = async (supplierId: string) => {
    try {
        const orders = await PurchaseOrder.find({ supplierId, isDeleted: false });
        return orders;
    } catch (error) {
        console.error('Error fetching purchase orders by supplier ID:', error);
        throw error;
    }
}
