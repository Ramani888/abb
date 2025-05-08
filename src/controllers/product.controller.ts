import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getUserById } from "../services/user.service";
import { deleteProductData, getProductData, insertProductData, updateProductData } from "../services/product.service";

export const insertProduct = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req?.body;
        const { userId } = req?.user;
        const userData = await getUserById(userId);

        await insertProductData({...bodyData, ownerId: userData?.ownerId, userId: userId});
        return res.status(StatusCodes.OK).send({ success: true, message: 'Product inserted successfully' });
    } catch (error) {
        console.error('Error inserting product:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const updateProduct = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req?.body;
        const { userId } = req?.user;

        await updateProductData({...bodyData, userId: userId});
        return res.status(StatusCodes.OK).send({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const getProduct = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        const data = await getProductData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error getting product:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error ' });
    }
}

export const deleteProduct = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req.query;
    try {
        await deleteProductData(_id);
        return res.status(StatusCodes.OK).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}