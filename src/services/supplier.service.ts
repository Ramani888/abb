import e from "express";
import { PurchaseOrder } from "../models/purchaseOrder.model";
import { Supplier } from "../models/supplier.model";
import { SupplierPayment } from "../models/supplierPayment.model";
import { ISupplier, ISupplierPayment } from "../types/supplier";
import mongoose from "mongoose";

export const insertSupplierData = async (data: ISupplier) => {
    try {
        const newData = new Supplier(data)
        await newData.save();
        return;
    } catch (error) {
        console.error('Error inserting supplier data:', error);
        throw error;
    }
}

export const getSupplierData = async (ownerId: string) => {
    try {
        // Fetch all suppliers for the owner
        const suppliers = await Supplier.find({ ownerId: ownerId, isDeleted: false });
        const supplierIds = suppliers.map(s => s._id);

        // Fetch all purchase orders for these suppliers
        const orders = await PurchaseOrder.find({ supplierId: { $in: supplierIds }, isDeleted: false });

        // Group orders by supplierId
        const orderStats: Record<string, { totalOrder: number, totalSpent: number }> = {};
        orders.forEach(order => {
            const sid = order.supplierId.toString();
            if (!orderStats[sid]) {
                orderStats[sid] = { totalOrder: 0, totalSpent: 0 };
            }
            orderStats[sid].totalOrder += 1;
            orderStats[sid].totalSpent += order.total || 0;
        });

        // Attach stats to each supplier
        return suppliers.map(supplier => {
            const stats = orderStats[supplier._id.toString()] || { totalOrder: 0, totalSpent: 0 };
            return {
                ...supplier.toObject(),
                totalOrder: stats.totalOrder,
                totalSpent: stats.totalSpent
            };
        });
    } catch (error) {
        console.error('Error fetching supplier data:', error);
        throw error;
    }
}

export const updateSupplierData = async (data: ISupplier) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());
        const result = await Supplier.findByIdAndUpdate(documentId, data, {
            new: true,
            runValidators: true
        });
    } catch (error) {
        console.error('Error updating supplier data:', error);
        throw error;
    }
}

export const deleteSupplierData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Supplier.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        console.error('Error deleting supplier data:', error);
        throw error;
    }
}

export const getSupplierDetailOrderData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const supplier = await Supplier.findById(documentId);
        if (!supplier) {
            throw new Error("Supplier not found");
        }

        // Get all orders for this supplier
        const orders = await PurchaseOrder.find({ supplierId: _id, isDeleted: false });

        // Calculate total order count
        const totalOrder = orders?.length;

        // Calculate total spent (assuming each order has a 'total' field)
        const totalSpent = orders?.reduce((sum, order) => sum + (order?.total || 0), 0);

        // Find last order date (assuming each order has a 'createdAt' field)
        const lastOrderDate = orders?.length > 0
            ? new Date(Math.max(...orders
                .map(order => order?.captureDate)
                .filter((date): date is Date => date instanceof Date)
                .map(date => new Date(date).getTime())
            ))
            : null;

        return {
            ...supplier.toObject(),
            orders: orders.map(order => order.toObject()),
            totalOrder,
            totalSpent,
            lastOrderDate
        };
    } catch (error) {
        throw error;
    }
}

export const createSupplierPaymentData = async (data: ISupplierPayment) => {
    try {
        const newData = new SupplierPayment(data);
        await newData.save();
        return;
    } catch (error) {
        throw error;
    }
}

export const getSupplierPaymentData = async (ownerId: string) => {
    try {
        const result = await SupplierPayment?.aggregate([
            {
                $match: { ownerId, isDeleted: false }
            },
            {
                $lookup: {
                    from: "Supplier",
                    let: { supplierId: "$supplierId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", { $toObjectId: "$$supplierId" }] }
                            }
                        }
                    ],
                    as: "supplierData"
                }
            },
            {
                $unwind: {
                    path: "$supplierData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    ownerId: 1,
                    supplierId: 1,
                    amount: 1,
                    paymentType: 1,
                    paymentMode: 1,
                    cardNumber: 1,
                    upiTransactionId: 1,
                    chequeNumber: 1,
                    gatewayTransactionId: 1,
                    bankReferenceNumber: 1,
                    captureDate: 1,
                    isDeleted: 1,
                    supplierData: "$supplierData",
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const updateSupplierPaymentData = async (data: ISupplierPayment) => {
    try {
        console.log('Data to update:', data);
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());

        // List of mutually exclusive fields
        const exclusiveFields = [
            "cardNumber",
            "upiTransactionId",
            "chequeNumber",
            "gatewayTransactionId",
            "bankReferenceNumber"
        ];

        // Find which field is present in the update
        const presentField = exclusiveFields.find(field => data[field as keyof ISupplierPayment]);
        console.log('Present field:', presentField);

        // Prepare $set and $unset objects
        const setFields: any = {};
        const unsetFields: any = {};

        // Set the present field, unset the rest
        exclusiveFields.forEach(field => {
            if (field === presentField && data[field as keyof ISupplierPayment]) {
                setFields[field] = data[field as keyof ISupplierPayment];
            } else {
                unsetFields[field] = "";
            }
        });

        // Add other fields to $set
        Object.keys(data).forEach(key => {
            if (!exclusiveFields.includes(key) && key !== "_id") {
                setFields[key] = data[key as keyof ISupplierPayment];
            }
        });

        const updateObj: any = {};
        if (Object.keys(setFields).length) updateObj.$set = setFields;
        if (Object.keys(unsetFields).length) updateObj.$unset = unsetFields;

        console.log('set fields:', setFields);
        console.log('unset fields:', unsetFields);
        console.log('Update object:', updateObj);

        const result = await SupplierPayment.findByIdAndUpdate(documentId, updateObj, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        throw error;
    }
}

export const deleteSupplierPaymentData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await SupplierPayment.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        throw error;
    }
}

export const getSupplierById = async (_id: string) => {
    try {
        const result = await Supplier?.findById(_id);
        return result?.toObject();
    } catch (error) {
        console.error('Error fetching supplier by ID:', error);
        throw error;
    }
}
