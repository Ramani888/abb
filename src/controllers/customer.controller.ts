import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { deleteCustomerData, getCustomerByNumberAndOwnerId, getCustomerData, getCustomerDetailOrderData, insertCustomerData, updateCustomerData } from "../services/customer.service";
import { getUserById } from "../services/user.service";

export const insertCustomer = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req?.body;
        const { userId } = req.user;
        const userData = await getUserById(userId);

        const existingCustomer = await getCustomerByNumberAndOwnerId(bodyData?.number, userData?.ownerId ?? '');
        if (existingCustomer) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This number is already register.' });

        await insertCustomerData({...bodyData, ownerId: userData?.ownerId, userId: userId});
        return res.status(StatusCodes.OK).send({ success: true, message: 'Customer inserted successfully' });
    } catch (error) {
        console.error('Error inserting customer:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const getCustomer = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        const data = await getCustomerData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error getting customer:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error ' });
    }
}

export const updateCustomer = async (req: AuthorizedRequest, res: Response) => {
    const bodyData = req?.body;
    const { userId } = req?.user;
    try {
        await updateCustomerData({...bodyData, userId});
        return res.status(StatusCodes.OK).json({ success: true, message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const deleteCustomer = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req.query;
    try {
        await deleteCustomerData(_id);
        return res.status(StatusCodes.OK).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const getCustomerDetailOrder = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req.query;
    const { userId } = req?.user;
    try {
        const userData = await getUserById(userId);
        if (!userData) return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });

        const customerData = await getCustomerDetailOrderData(_id);
        if (!customerData) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Customer not found' });

        return res.status(StatusCodes.OK).json({ success: true, data: customerData });
    } catch (error) {
        console.error('Error getting customer detail order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}