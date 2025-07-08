import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getUserById } from "../services/user.service";
import { createSupplierPaymentData, deleteSupplierData, deleteSupplierPaymentData, getSupplierById, getSupplierData, getSupplierDetailOrderData, getSupplierPaymentData, insertSupplierData, updateSupplierData, updateSupplierPaymentData } from "../services/supplier.service";
import { insertNotificationData } from "../services/notification.service";

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

export const getSupplierDetailOrder = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req.query;
    const { userId } = req?.user;
    try {
        const userData = await getUserById(userId);
        if (!userData) return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });

        const supplierData = await getSupplierDetailOrderData(_id);
        if (!supplierData) return res.status(StatusCodes.NOT_FOUND).json({ message: 'Supplier not found' });

        return res.status(StatusCodes.OK).json({ success: true, data: supplierData });
    } catch (error) {
        console.error('Error getting supplier detail order:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const createSupplierPayment = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req?.user;
    const bodyData = req?.body;
    try {
        const userData = await getUserById(userId);
        const supplierData = await getSupplierById(bodyData?.supplierId);
        if (!userData) return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });

        await createSupplierPaymentData({...bodyData, userId, ownerId: userData?.ownerId});

        // Notification for supplier payment creation
        const data = {
            ownerId: userData?.ownerId ?? '',
            userId: userId,
            type: "payment" as "payment",
            name: 'Payment Outlay',
            description: `Payment outlay of ${bodyData?.amount} has been made for ${supplierData?.name ?? 'Unknown Supplier'}.`,
            link: `/suppliers/${bodyData?.supplierId}`,
        };
        await insertNotificationData(data);

        return res.status(StatusCodes.OK).json({ success: true, message: 'Supplier payment created successfully' });
    } catch (error) {
        console.error('Error creating supplier payment:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const getSupplierPayment = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        // Assuming you have a service to fetch supplier payment data
        const data = await getSupplierPaymentData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error getting supplier payment:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const updateSupplierPayment = async (req: AuthorizedRequest, res: Response) => {
    const bodyData = req?.body;
    const { userId } = req?.user;
    try {
        await updateSupplierPaymentData({ ...bodyData, userId });
        return res.status(StatusCodes.OK).json({ success: true, message: 'Supplier payment updated successfully' });
    } catch (error) {
        console.error('Error updating supplier payment:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const deleteSupplierPayment = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req.query;
    try {
        await deleteSupplierPaymentData(_id);
        return res.status(StatusCodes.OK).json({ success: true, message: 'Supplier payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting supplier payment:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}