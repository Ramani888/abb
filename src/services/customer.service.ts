import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import { ICustomer } from "../types/customer";

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