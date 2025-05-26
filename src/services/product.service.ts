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
                $match: { ownerId: ownerId, isDeleted: false }
            },
            {
                $addFields: {
                    categoryIdStr: { $toString: "$categoryId" }
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
                    unit: 1,
                    description: 1,
                    sku: 1,
                    barcode: 1,
                    retailPrice: 1,
                    wholesalePrice: 1,
                    purchasePrice: 1,
                    quantity: 1,
                    minStockLevel: 1,
                    taxRate: 1,
                    packingSize: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    categoryName: { $ifNull: ["$categoryData.name", "Unknown Category"] },
                    status: {
                        $cond: [
                            { $eq: ["$quantity", 0] },
                            "Out of Stock",
                            {
                                $cond: [
                                    { $lt: ["$quantity", "$minStockLevel"] },
                                    "Low Stock",
                                    "In Stock"
                                ]
                            }
                        ]
                    }
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
        // const result = await Product.findByIdAndDelete(documentId);
        // return result;
        const result = await Product.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        throw error;
    }
}