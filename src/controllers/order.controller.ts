import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getUserById } from "../services/user.service";
import { createOrderData, deleteOrderData, getOrderData, updateOrderData } from "../services/order.service";
import { generateInvoiceNumber } from "../utils/helpers/general";

export const createOrder = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const bodyData = req?.body;
        const userData = await getUserById(userId);

        const invoiceNumber = generateInvoiceNumber();

        await createOrderData({
            ...bodyData,
            ownerId: userData?.ownerId,
            userId: userId,
            invoiceNumber: invoiceNumber
        });
        return res.status(StatusCodes.OK).json({ success: true, message: 'Order created successfully' });
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

        await updateOrderData({
            ...bodyData,
            userId: userId
        });
        return res.status(StatusCodes.OK).json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}

export const deleteOrder = async (req: AuthorizedRequest, res: Response) => {
    try {
        const { _id } = req?.query;
        await deleteOrderData(_id);
        return res.status(StatusCodes.OK).json({ success: true, message: 'Order deleted successfully' });
    } catch (error) {
        console.log('Error deleting order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal server error' });
    }
}