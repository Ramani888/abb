import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { insertCustomerData } from "../services/customer.service";

export const insertCustomer = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req?.body;

        await insertCustomerData(bodyData);
        res.status(StatusCodes.OK).send({ success: true, message: 'Customer inserted successfully' });
    } catch (error) {
        console.error('Error inserting customer:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}