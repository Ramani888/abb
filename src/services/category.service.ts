import { Category } from "../models/category.model";
import { ICategory } from "../types/category";
import mongoose from "mongoose";

export const insertCategoryData = async (data: ICategory) => {
    try {
        const newData = new Category(data);
        await newData.save();
        return;
    } catch (error) {
        console.error('Error inserting category:', error);
        throw error;
    }
}

export const updateCategoryData = async (data: ICategory) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());
        const result = await Category.findByIdAndUpdate(documentId, data, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}

export const getCategoryData = async (ownerId: string) => {
    try {
        const result = await Category?.find({ ownerId: ownerId });
        return result?.map((item) => item.toObject());
    } catch (error) {
        console.error('Error getting category:', error);
        throw error;
    }
}

export const deleteCategoryData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Category.findByIdAndDelete(documentId);
        return result;
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}