import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getUserById } from "../services/user.service";
import { generateInvoiceNumber } from "../utils/helpers/general";
import { createPurchaseOrderData, deletePurchaseOrderData, getAllPurchaseOrderDataBySupplierId, getPurchaseOrderById, getPurchaseOrderData, updatePurchaseOrderData } from "../services/purchaseOrder.service";
import { addProductVariantQuantity, getProductVariantData, logStockChange, subtractProductVariantQuantity } from "../services/product.service";

export const createPurchaseOrder = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const bodyData = req?.body;
        const userData = await getUserById(userId);

        const invoiceNumber = generateInvoiceNumber();

        // // check we have sufficient stock for each product in the purchase order
        // if (bodyData?.products && Array.isArray(bodyData.products)) {
        //     await Promise.all(
        //         bodyData.products.map(async (item: any) => {
        //             const productData = await getProductVariantData(item?.productId, item?.variantId);
        //             // check current stock and item quantity
        //             const currentStock = productData?.variants?.[0]?.quantity ?? 0;
        //             const variantData = productData?.variants?.[0];
        //             if (currentStock < item.quantity) {
        //                 return res.status(StatusCodes.BAD_REQUEST).json({ message: `Cannot create: becuase ${productData?.name}${variantData?.packingSize} has only ${currentStock} in stock, but you are trying to create it with ${item.quantity}.` });
        //             }
        //         })
        //     );
        // }

        // Add stock log
        if (bodyData?.products && Array.isArray(bodyData.products)) {
            await Promise.all(
                bodyData.products.map(async (item: any) => {
                    const productData = await getProductVariantData(item?.productId, item?.variantId);
                    const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                    const stockLogData = {
                        ownerId: userData?.ownerId ?? '',
                        userId: userId,
                        productId: item?.productId,
                        variantId: item?.variantId,
                        type: 'purchase',
                        quantity: item?.quantity,
                        balanceAfter: currentStock + item?.quantity, // Assuming this is the initial stock after sale
                    }
                    await logStockChange(stockLogData)
                })
            );
        }

        await createPurchaseOrderData({
            ...bodyData,
            ownerId: userData?.ownerId,
            userId: userId,
            invoiceNumber: invoiceNumber
        });

        if (bodyData?.products && Array.isArray(bodyData.products)) {
            await Promise.all(
                bodyData.products.map(async (item: any) => {
                    // Process each product item as needed
                    await addProductVariantQuantity(item?.productId, item?.variantId, item?.quantity);
                })
            );
        }
        return res.status(StatusCodes.OK).json({ success: true, message: 'Purchase order created successfully' });
    } catch (error) {
        console.error('Error creating purchase order:', error);
        return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
    }
}

export const getPurchaseOrder = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        const data = await getPurchaseOrderData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching purchase order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const updatePurchaseOrder = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const bodyData = req?.body;
        const userData = await getUserById(userId);

        const purchaseOrderData = await getPurchaseOrderById(bodyData?._id);

        // give me variable for stock
        let isStock = false;

        // for checking stock availability
        if(bodyData?.products && Array.isArray(bodyData.products)) {
            await Promise.all(
                bodyData.products.map(async (item: any) => {
                    const productData = await getProductVariantData(item?.productId, item?.variantId);
                    // // check current stock and item quantity
                    const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                    const variantData = productData?.variants?.[0];

                    const oldVariantData = purchaseOrderData?.products?.find((product: any) => product?.variantId === item?.variantId);
                    const oldQuantity = oldVariantData?.quantity ?? 0;
                    if (oldQuantity < item?.quantity) {
                        const newQuantity = item?.quantity - oldQuantity;
                        if (currentStock < newQuantity) {
                            isStock = true;
                            return res.status(StatusCodes.BAD_REQUEST).json({ message: `Cannot update: becuase ${productData?.name}${variantData?.packingSize} has only ${currentStock} in stock, but you are trying to update it to ${item.quantity}.` });
                        }
                    } else {
                        const newQuantity = oldQuantity - item?.quantity;
                        if (currentStock < newQuantity) {
                            isStock = true;
                            return res.status(StatusCodes.BAD_REQUEST).json({ message: `Cannot update: becuase ${productData?.name}${variantData?.packingSize} has only ${currentStock} in stock, but you are trying to update it to ${item.quantity}.` });
                        }
                    }
                })
            );
        }

        if (!isStock) {
            // Add stock log
            if (bodyData?.products && Array.isArray(bodyData.products)) {
                await Promise.all(
                    bodyData.products.map(async (item: any) => {
                        const productData = await getProductVariantData(item?.productId, item?.variantId);
                        const oldVariantData = purchaseOrderData?.products?.find((product: any) => product?.variantId === item?.variantId);
                        const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                        const oldQuantity = oldVariantData?.quantity ?? 0;
                        const newQuantity = oldQuantity - item?.quantity;
                        const balanceAfter = newQuantity < 0 ? currentStock + Math.abs(newQuantity) : currentStock - newQuantity;
                        const stockLogData = {
                            ownerId: userData?.ownerId ?? '',
                            userId: userId,
                            productId: item?.productId,
                            variantId: item?.variantId,
                            type: 'update_purchase',
                            quantity: item?.quantity,
                            balanceAfter: balanceAfter // Assuming this is the initial stock after sale
                        }
                        await logStockChange(stockLogData)
                    })
                );
            }

            await updatePurchaseOrderData({
                ...bodyData,
                userId: userId
            });
    
            if (bodyData?.products && Array.isArray(bodyData.products)) {
                await Promise.all(
                    bodyData.products.map(async (item: any) => {
                        const oldVariantData = purchaseOrderData?.products?.find((product: any) => product?.variantId === item?.variantId);
                        const oldQuantity = oldVariantData?.quantity ?? 0;
                        const newQuantity = oldQuantity - item?.quantity;
                        // check new quantity is negative or not
                        if (newQuantity < 0) {
                            await addProductVariantQuantity(item?.productId, item?.variantId, Math.abs(newQuantity));
                        } else {
                            // Process each product item as needed
                            await subtractProductVariantQuantity(item?.productId, item?.variantId, newQuantity);
                        }
                    })
                );
            }
            return res.status(StatusCodes.OK).json({ success: true, message: 'Purchase order updated successfully' });
        }

    } catch (error) {
        console.error('Error updating purchase order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const deletePurchaseOrder = async (req: AuthorizedRequest, res: Response) => {
    try {
        const { userId } = req.user;
        const { _id } = req?.query;
        const purchaseOrderData = await getPurchaseOrderById(_id);
        const userData = await getUserById(userId);

        let isStock = false;

        // for checking stock availability
        if(purchaseOrderData?.products && Array.isArray(purchaseOrderData.products)) {
            await Promise.all(
                purchaseOrderData?.products.map(async (item: any) => {
                    const productData = await getProductVariantData(item?.productId, item?.variantId);
                    // check current stock and item quantity
                    const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                    const variantData = productData?.variants?.[0];
                    if (currentStock < item.quantity) {
                        isStock = true;
                        return res.status(StatusCodes.BAD_REQUEST).json({ message: `Cannot update: becuase ${productData?.name}${variantData?.packingSize} has only ${currentStock} in stock, but you are trying to update it to ${item.quantity}.` });
                    }
                })
            );
        }

        if (!isStock) {
            // Add stock log
            if (purchaseOrderData?.products && Array.isArray(purchaseOrderData.products)) {
                await Promise.all(
                    purchaseOrderData.products.map(async (item: any) => {
                        const productData = await getProductVariantData(item?.productId, item?.variantId);
                        const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                        const stockLogData = {
                            ownerId: userData?.ownerId ?? '',
                            userId: userId,
                            productId: item?.productId,
                            variantId: item?.variantId,
                            type: 'delete_purchase',
                            quantity: item?.quantity,
                            balanceAfter: currentStock - item?.quantity, // Assuming this is the initial stock after sale
                        }
                        await logStockChange(stockLogData)
                    })
                );
            }

            await deletePurchaseOrderData(_id);
    
            if (purchaseOrderData?.products && Array.isArray(purchaseOrderData?.products)) {
                await Promise.all(
                    purchaseOrderData?.products.map(async (item: any) => {
                        await subtractProductVariantQuantity(item?.productId, item?.variantId,  item?.quantity);
                    })
                );
            }
            return res.status(StatusCodes.OK).json({ success: true, message: 'Purchase order deleted successfully' });
        }

    } catch (error) {
        console.error('Error deleting purchase order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const getAllPurchaseOrderBySupplierId = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req.query;
    try {
        const data = await getAllPurchaseOrderDataBySupplierId(_id);
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching purchase orders by supplier ID:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}