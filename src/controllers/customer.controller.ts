import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getCustomerByNumber, getCustomerData, insertCustomerData } from "../services/customer.service";
import { getOwnerById, getUserById } from "../services/user.service";

export const insertCustomer = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req?.body;
        const userData = await getUserById(bodyData?.userId);

        const existingCustomer = await getCustomerByNumber(bodyData?.number);
        if (existingCustomer) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This number is already register.' });

        await insertCustomerData({...bodyData, ownerId: userData?.ownerId});
        res.status(StatusCodes.OK).send({ success: true, message: 'Customer inserted successfully' });
    } catch (error) {
        console.error('Error inserting customer:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const getCustomer = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.query;
    try {
        const userData = await getUserById(userId);
        const data = await getCustomerData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error getting customer:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error ' });
    }
}