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
        const suppliers = await Supplier.find({ ownerId, isDeleted: false }).sort({ captureDate: -1 });
        return suppliers;
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