import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { insertShopData } from "../services/shop.service";

export const insertShop = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req.body;
        await insertShopData(bodyData);
        return res.status(StatusCodes.OK).json({ message: 'Shop inserted successfully' });
    } catch (error) {
        console.error('Error inserting shop:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}