import { Product } from "../models/product.model";
import { StockLog } from "../models/stockLog.model";
import { IProduct, IStockLog } from "../types/product";
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

export const getProductVariantData = async (productId: string, variantId: string) => {
  try {
    const documentId = new mongoose.Types.ObjectId(productId);
    const variantObjectId = new mongoose.Types.ObjectId(variantId);

    const product = await Product.findOne({ _id: documentId });

    if (!product) throw new Error("Product not found");

    const matchedVariant = product.variants.find(v => v._id.equals(variantObjectId));

    if (!matchedVariant) throw new Error("Variant not found");

    const productData = product.toObject() as Record<string, any>;

    // Replace full variants array with only the matched one (in an array of plain objects)
    productData.variants = [
      matchedVariant.toObject ? matchedVariant.toObject() : JSON.parse(JSON.stringify(matchedVariant))
    ];

    return productData;
  } catch (error) {
    throw error;
  }
};


export const addProductVariantQuantity = async (productId: string, variantId: string, newQuantity: number) => {
  try {
    const documentId = new mongoose.Types.ObjectId(productId);
    const variantObjectId = new mongoose.Types.ObjectId(variantId);
    const result = await Product.updateOne(
      { _id: documentId, 'variants._id': variantObjectId },
      { $inc: { 'variants.$.quantity': newQuantity } }
    );



    if (result.modifiedCount === 0) {
      console.log('No variant was updated. Check if productId and variantId are correct.');
    } else {
      console.log('Variant quantity updated successfully.');
    }
  } catch (error) {
    console.error('Error updating variant quantity:', error);
    throw error;
  }
}

export const subtractProductVariantQuantity = async (productId: string, variantId: string, newQuantity: number) => {
  try {
    const documentId = new mongoose.Types.ObjectId(productId);
    const variantObjectId = new mongoose.Types.ObjectId(variantId);
    const result = await Product.updateOne(
      { _id: documentId, 'variants._id': variantObjectId },
      { $inc: { 'variants.$.quantity': -Math.abs(newQuantity) } }
    );

    console.log('result', result);

    if (result.modifiedCount === 0) {
      console.log('No variant was updated. Check if productId and variantId are correct.');
    } else {
      console.log('Variant quantity updated successfully.');
    }
  } catch (error) {
    console.error('Error updating variant quantity:', error);
    throw error;
  }
}

export const logStockChange = async (data: IStockLog) => {
  // Get current quantity after update
//   const product = await Product.findOne(
//     { _id: productId, "variants._id": variantId },
//     { "variants.$": 1 }
//   );

//   if (!product || !product.variants || product.variants.length === 0) {
//     throw new Error("Product or variant not found.");
//   }

//   const currentQty = product.variants[0].quantity;

//   await StockLog.create({
//     productId,
//     variantId,
//     type,
//     quantity,
//     balanceAfter: currentQty,
//     referenceId,
//     note,
//   });

    try {
        const newData = new StockLog(data);
        await newData.save();
        return;
    } catch (error) {
        console.error('Error logging stock change:', error);
        throw error;
    }
}