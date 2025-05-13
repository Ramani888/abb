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
        const categories = await Category.aggregate([
            {
                $match: { ownerId: ownerId }
            },
            {
                $addFields: {
                    categoryIdStr: { $toString: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "Product", // Make sure this matches your actual Product collection name
                    let: { categoryId: "$categoryIdStr" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { 
                                    $and: [
                                        { $eq: ["$categoryId", "$$categoryId"] },
                                        { $eq: ["$ownerId", ownerId] }
                                    ]
                                }
                            }
                        },
                        {
                            $count: "count"
                        }
                    ],
                    as: "productCountData"
                }
            },
            {
                $addFields: {
                    productCount: {
                        $cond: {
                            if: { $gt: [{ $size: "$productCountData" }, 0] },
                            then: { $arrayElemAt: ["$productCountData.count", 0] },
                            else: 0
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    ownerId: 1,
                    userId: 1,
                    name: 1,
                    description: 1,
                    isActive: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    productCount: 1
                    // Only include fields you want to keep
                }
            }
        ]);
        
        return categories;
    } catch (error) {
        console.error('Error getting category with product count:', error);
        throw error;
    }
}

export const getActiveCategoryData = async (ownerId: string) => {
    try {
        const categories = await Category.aggregate([
            {
                $match: { ownerId: ownerId, isActive: true }
            },
            {
                $addFields: {
                    categoryIdStr: { $toString: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "Product", // Make sure this matches your actual Product collection name
                    let: { categoryId: "$categoryIdStr" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { 
                                    $and: [
                                        { $eq: ["$categoryId", "$$categoryId"] },
                                        { $eq: ["$ownerId", ownerId] }
                                    ]
                                }
                            }
                        },
                        {
                            $count: "count"
                        }
                    ],
                    as: "productCountData"
                }
            },
            {
                $addFields: {
                    productCount: {
                        $cond: {
                            if: { $gt: [{ $size: "$productCountData" }, 0] },
                            then: { $arrayElemAt: ["$productCountData.count", 0] },
                            else: 0
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    ownerId: 1,
                    userId: 1,
                    name: 1,
                    description: 1,
                    isActive: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    productCount: 1
                    // Only include fields you want to keep
                }
            }
        ]);
        
        return categories;
    } catch (error) {
        console.error('Error getting category with product count:', error);
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