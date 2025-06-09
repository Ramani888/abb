import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import { ICustomer } from "../types/customer";
import { Order } from "../models/order.model";

export const insertCustomerData = async (data: ICustomer) => {
    try {
        const newData = new Customer(data);
        await newData.save();
        return;
    } catch (error) {
        throw error;
    }
}

export const getCustomerData = async (ownerId: string) => {
    try {
        const result = await Customer?.find({ ownerId: ownerId });
        return result?.map((item) => item.toObject());
    } catch (error) {
        throw error;
    }
}

export const getCustomerDetailOrderData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const customer = await Customer.findById(documentId);
        if (!customer) {
            throw new Error("Customer not found");
        }

        // Get all orders for this customer
        const orders = await Order.find({ customerId: _id, isDeleted: false });

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
            ...customer.toObject(),
            orders: orders.map(order => order.toObject()),
            totalOrder,
            totalSpent,
            lastOrderDate
        };
    } catch (error) {
        throw error;
    }
}


export const getCustomerByNumberAndOwnerId = async (number: number, ownerId: string) => {
    try {
        const result = await Customer?.findOne({ number: number, ownerId: ownerId });
        return result?.toObject();
    } catch (error) {
        throw error;
    }
}

export const updateCustomerData = async (data: ICustomer) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());
        const result = await Customer.findByIdAndUpdate(documentId, data, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        throw error;
    }
}

export const deleteCustomerData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Customer.findByIdAndDelete(documentId);
        return result;
    } catch (error) {
        throw error;
    }
}