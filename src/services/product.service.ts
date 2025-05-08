import { Product } from "../models/product.model";
import { IProduct } from "../types/product";
import mongoose from "mongoose";

export const insertProductData = async (data: IProduct) => {
    try {
        const newData = new Product(data);
        await newData.save();
        return;
    } catch (error) {
        throw error;
    }
}

export const updateProductData = async (data: IProduct) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());
        const result = await Product.findByIdAndUpdate(documentId, data, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        throw error;
    }
}

export const getProductData = async (ownerId: string) => {
    try {
        const result = await Product?.find({ ownerId: ownerId });
        return result?.map((item) => item.toObject());
    } catch (error) {
        throw error;
    }
}

export const deleteProductData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Product.findByIdAndDelete(documentId);
        return result;
    } catch (error) {
        throw error;
    }
}