import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getUserById } from "../services/user.service";
import { generateInvoiceNumber } from "../utils/helpers/general";
import { createPurchaseOrderData, deletePurchaseOrderData, getPurchaseOrderData, updatePurchaseOrderData } from "../services/purchaseOrder.service";

export const createPurchaseOrder = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const bodyData = req?.body;
        const userData = await getUserById(userId);

        const invoiceNumber = generateInvoiceNumber();

        await createPurchaseOrderData({
            ...bodyData,
            ownerId: userData?.ownerId,
            userId: userId,
            invoiceNumber: invoiceNumber
        });
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

        await updatePurchaseOrderData({
            ...bodyData,
            userId: userId
        });
        return res.status(StatusCodes.OK).json({ success: true, message: 'Purchase order updated successfully' });
    } catch (error) {
        console.error('Error updating purchase order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const deletePurchaseOrder = async (req: AuthorizedRequest, res: Response) => {
    try {
        const { _id } = req?.query;
        await deletePurchaseOrderData(_id);
        return res.status(StatusCodes.OK).json({ success: true, message: 'Purchase order deleted successfully' });
    } catch (error) {
        console.log('Error deleting purchase order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}