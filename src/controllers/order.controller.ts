import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getUserById } from "../services/user.service";
import { createOrderData, deleteOrderData, generateInvoicePdfBytes, generateSlipPdfBytes, getAllOrderDataByCustomerId, getOrderById, getOrderData, updateOrderData } from "../services/order.service";
import { generateInvoiceNumber } from "../utils/helpers/general";
import { addProductVariantQuantity, getProductVariantData, logStockChange, subtractProductVariantQuantity } from "../services/product.service";
import { insertNotificationData } from "../services/notification.service";

export const createOrder = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const bodyData = req?.body;
        const userData = await getUserById(userId);

        const invoiceNumber = generateInvoiceNumber();

        let isStock = false;

        // check we have sufficient stock for each product in the purchase order
        if (bodyData?.products && Array.isArray(bodyData.products)) {
            await Promise.all(
                bodyData.products.map(async (item: any) => {
                    const productData = await getProductVariantData(item?.productId, item?.variantId);
                    // check current stock and item quantity
                    const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                    const variantData = productData?.variants?.[0];
                    if (currentStock < item.quantity) {
                        isStock = true;
                        return res.status(StatusCodes.BAD_REQUEST).json({ message: `Cannot create: becuase ${productData?.name}${variantData?.packingSize} has only ${currentStock} in stock, but you are trying to create it with ${item.quantity}.` });
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
                        const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                        const stockLogData = {
                            ownerId: userData?.ownerId ?? '',
                            userId: userId,
                            productId: item?.productId,
                            variantId: item?.variantId,
                            type: 'sale',
                            quantity: item?.quantity,
                            balanceAfter: currentStock - item?.quantity, // Assuming this is the initial stock after sale
                        }
                        await logStockChange(stockLogData)
                    })
                );
            }


            const newOrder = await createOrderData({
                ...bodyData,
                ownerId: userData?.ownerId,
                userId: userId,
                invoiceNumber: invoiceNumber
            });
    
            if (bodyData?.products && Array.isArray(bodyData.products)) {
                await Promise.all(
                    bodyData.products.map(async (item: any) => {
                        // Process each product item as needed
                        // For example, you might want to update stock or perform other actions
                        await subtractProductVariantQuantity(item?.productId, item?.variantId, item?.quantity);
                    })
                );
            }

            //Notification for order creation
            const data = {
                ownerId: userData?.ownerId ?? '',
                userId: userId,
                type: "order" as "order",
                name: 'New Sales Order Created',
                description: `Order ${invoiceNumber} has been placed by ${userData?.name ?? 'Unknown User'}.`,
                link: `/orders/${newOrder?._id?.toString()}`,
            }
            await insertNotificationData(data)

            //Notification for low stock and out of stock
            // so first we need latest data after order creation so not use bodydata products
            if (bodyData?.products && Array.isArray(bodyData.products)) {
                await Promise.all(
                    bodyData.products.map(async (item: any) => {
                        const productData = await getProductVariantData(item?.productId, item?.variantId);
                        const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                        const minStockLevel = productData?.variants?.[0]?.minStockLevel ?? 0;
                        if (currentStock < minStockLevel) {
                            const stockNotificationData = {
                                ownerId: userData?.ownerId ?? '',
                                userId: userId,
                                type: "stock" as "stock",
                                name: currentStock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
                                description: `Product ${productData?.name} ${productData?.variants?.[0]?.packingSize} is running low on stock. Current stock is ${currentStock}.`,
                                link: `/products`,
                            }
                            await insertNotificationData(stockNotificationData)
                        }
                    })
                );
            }
    
            return res.status(StatusCodes.OK).json({ success: true, message: 'Order created successfully', data: newOrder });
        }

    } catch (error) {
        console.error('Error creating order:', error);
        return { status: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Internal server error' };
    }
}

export const getOrder = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        const data = await getOrderData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const updateOrder = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const bodyData = req?.body;
        const userData = await getUserById(userId);

        const orderData = await getOrderById(bodyData?._id);

        let isStock = false;

        // for checking stock availability
        if (bodyData?.products && Array.isArray(bodyData.products)) {
            await Promise.all(
                bodyData.products.map(async (item: any) => {
                    const productData = await getProductVariantData(item?.productId, item?.variantId);

                    const currentStock = productData?.variants?.[0]?.quantity || 0;
                    const variantData = productData?.variants?.[0];

                    const oldVariantData = orderData?.products?.find((p: any) => p.productId === item?.productId && p.variantId === item?.variantId);
                    const oldQuantity = oldVariantData?.quantity || 0;
                    if (oldQuantity < item?.quantity) {
                        const newQuantity = item?.quantity - oldQuantity;
                        if (currentStock < newQuantity) {
                            isStock = true;
                            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Cannot update: becuase ${productData?.name}${variantData?.packingSize} has only ${currentStock} in stock, but you are trying to update it to ${item.quantity}.` });
                        }
                    } else {
                        const newQuantity = oldQuantity - item?.quantity;
                        if (currentStock < newQuantity) {
                            isStock = true;
                            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `Cannot update: becuase ${productData?.name}${variantData?.packingSize} has only ${currentStock} in stock, but you are trying to update it to ${item.quantity}.` });
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
                        const oldVariantData = orderData?.products?.find((p: any) => p.productId === item?.productId && p.variantId === item?.variantId);
                        const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                        const oldQuantity = oldVariantData?.quantity || 0;
                        const newQuantity = oldQuantity - item?.quantity;
                        const balanceAfter = newQuantity < 0 ? currentStock - Math.abs(newQuantity) : currentStock + newQuantity;
                        const stockLogData = {
                            ownerId: userData?.ownerId ?? '',
                            userId: userId,
                            productId: item?.productId,
                            variantId: item?.variantId,
                            type: 'update_sale',
                            quantity: item?.quantity,
                            balanceAfter: balanceAfter, // Assuming this is the initial stock after sale
                        }
                        await logStockChange(stockLogData)
                    })
                );
            }

            // Update order data
            await updateOrderData({
                ...bodyData,
                userId: userId
            });
    
            if (bodyData?.products && Array.isArray(bodyData.products)) {
                await Promise.all(
                    bodyData.products.map(async (item: any) => {
                        const oldVariantData = orderData?.products?.find((p: any) => p.productId === item?.productId && p.variantId === item?.variantId);
                        const oldQuantity = oldVariantData?.quantity || 0;
                        const newQuantity = oldQuantity - item?.quantity;
    
                        // If the quantity has changed, update the stock
                        if (newQuantity < 0) {
                            // await addProductVariantQuantity(item?.productId, item?.variantId, Math.abs(newQuantity));
                            await subtractProductVariantQuantity(item?.productId, item?.variantId, Math.abs(newQuantity));
                        } else {
                            // await subtractProductVariantQuantity(item?.productId, item?.variantId, newQuantity);
                            await addProductVariantQuantity(item?.productId, item?.variantId, newQuantity);
                        }
                    })
                );
            }
            return res.status(StatusCodes.OK).json({ success: true, message: 'Order updated successfully' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const deleteOrder = async (req: AuthorizedRequest, res: Response) => {
    try {
        const { userId } = req.user;
        const { _id } = req?.query;
        const orderData = await getOrderById(_id);
        const userData = await getUserById(userId);

        let isStock = false;

        // // for checking stock availability
        // if(orderData?.products && Array.isArray(orderData.products)) {
        //     await Promise.all(
        //         orderData?.products.map(async (item: any) => {
        //             const productData = await getProductVariantData(item?.productId, item?.variantId);
        //             // check current stock and item quantity
        //             const currentStock = productData?.variants?.[0]?.quantity ?? 0;
        //             const variantData = productData?.variants?.[0];
        //             if (currentStock < item.quantity) {
        //                 isStock = true;
        //                 return res.status(StatusCodes.BAD_REQUEST).json({ message: `Cannot update: becuase ${productData?.name}${variantData?.packingSize} has only ${currentStock} in stock, but you are trying to update it to ${item.quantity}.` });
        //             }
        //         })
        //     );
        // }

        if (!isStock) {
            // Add stock log
            if (orderData?.products && Array.isArray(orderData.products)) {
                await Promise.all(
                    orderData.products.map(async (item: any) => {
                        const productData = await getProductVariantData(item?.productId, item?.variantId);
                        const currentStock = productData?.variants?.[0]?.quantity ?? 0;
                        const stockLogData = {
                            ownerId: userData?.ownerId ?? '',
                            userId: userId,
                            productId: item?.productId,
                            variantId: item?.variantId,
                            type: 'delete_sale',
                            quantity: item?.quantity,
                            balanceAfter: currentStock + item?.quantity, // Assuming this is the initial stock after sale
                        }
                        await logStockChange(stockLogData)
                    })
                );
            }
            
            await deleteOrderData(_id);
    
            if (orderData?.products && Array.isArray(orderData?.products)) {
                await Promise.all(
                    orderData?.products.map(async (item: any) => {
                        await addProductVariantQuantity(item?.productId, item?.variantId,  item?.quantity);
                    })
                );
            }
            return res.status(StatusCodes.OK).json({ success: true, message: 'Order deleted successfully' });
        }

    } catch (error) {
        console.error('Error deleting order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const getAllOrderByCustomerId = async (req: AuthorizedRequest, res: Response) => {
    try {
        const { _id } = req?.query;
        const orderData = await getAllOrderDataByCustomerId(_id);
        return res.status(StatusCodes.OK).json({ success: true, data: orderData });
    } catch (error) {
        console.error('Error fetching orders by customer ID:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const generateInvoicePdf = async (req: AuthorizedRequest, res: Response) => {
    try {
        const pdfBytes = await generateInvoicePdfBytes();
        
        // Set proper headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBytes.length,
            'Content-Disposition': 'inline; filename="invoice.pdf"'
        });
        
        return res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const generateSlipPdf = async (req: AuthorizedRequest, res: Response) => {
    try {
        const pdfBytes = await generateSlipPdfBytes();

        // Set proper headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBytes.length,
            'Content-Disposition': 'inline; filename="slip.pdf"'
        });

        return res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Error generating slip PDF:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}