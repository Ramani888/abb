import { PurchaseOrder } from "../models/purchaseOrder.model";
import { Supplier } from "../models/supplier.model";
import { ISupplier } from "../types/supplier";
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
