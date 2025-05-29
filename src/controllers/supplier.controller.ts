import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getUserById } from "../services/user.service";
import { deleteSupplierData, getSupplierData, insertSupplierData, updateSupplierData } from "../services/supplier.service";

export const addSupplier = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req?.body;
        const { userId } = req?.user;
        const userData = await getUserById(userId);

        // Assuming you have a service to handle supplier data insertion
        await insertSupplierData({ ...bodyData, userId, ownerId: userData?.ownerId });
        res.status(StatusCodes.OK).send({ success: true, message: 'Supplier added successfully' });
    } catch (error) {
        console.error('Error adding supplier:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const getSupplier = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        // Assuming you have a service to fetch supplier data
        const data = await getSupplierData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error getting supplier:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const updateSupplier = async (req: AuthorizedRequest, res: Response) => {
    const bodyData = req?.body;
    const { userId } = req?.user;
    try {
        await updateSupplierData({ ...bodyData, userId });
        return res.status(StatusCodes.OK).json({ success: true, message: 'Supplier updated successfully' });
    } catch (error) {
        console.error('Error updating supplier:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const deleteSupplier = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req.query;
    try {
        await deleteSupplierData(_id);
        return res.status(StatusCodes.OK).json({ success: true, message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}