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
        const products = await Product.aggregate([
            {
                $match: {
                    ownerId: ownerId,
                    $or: [
                        { isDeleted: false },
                        { isDeleted: { $exists: false } }
                    ]
                }

            },
            {
                $addFields: {
                    categoryIdStr: { $toString: "$categoryId" },
                    variants: {
                        $map: {
                            input: "$variants",
                            as: "variant",
                            in: {
                                $mergeObjects: [
                                    "$$variant",
                                    { status: 
                                        {
                                            $cond: [
                                                { $eq: ["$$variant.quantity", 0] },
                                                "Out of Stock",
                                                {
                                                    $cond: [
                                                        { $lt: ["$$variant.quantity", "$$variant.minStockLevel"] },
                                                        "Low Stock",
                                                        "In Stock"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    variantsCount: { $size: "$variants" }
                }
            },
            {
                $lookup: {
                    from: "Category", // Use your actual collection name here
                    let: { categoryId: "$categoryIdStr" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", { $toObjectId: "$$categoryId" }] }
                            }
                        }
                    ],
                    as: "categoryData"
                }
            },
            {
                $unwind: {
                    path: "$categoryData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    ownerId: 1,
                    userId: 1,
                    name: 1,
                    categoryId: 1,
                    categoryName: { $ifNull: ["$categoryData.name", "Unknown Category"] },
                    description: 1,
                    variants: 1,
                    variantsCount: 1,
                    captureDate: 1,
                    createdAt: 1,
                    updatedAt: 1,
                }
            }
        ]);
        
        return products;
    } catch (error) {
        throw error;
    }
}

export const deleteProductData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Product.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        throw error;
    }
}