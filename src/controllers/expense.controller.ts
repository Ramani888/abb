import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getUserById } from "../services/user.service";
import { createExpenseData, deleteExpenseData, getExpenseData, updateExpenseData } from "../services/expense.service";

export const createExpense = async (req: AuthorizedRequest, res: Response) => {
	try {
		const bodyData = req.body;
        const { userId } = req.user;
        const userData = await getUserById(userId);

        await createExpenseData({ ...bodyData, ownerId: userData?.ownerId, userId: userId });
		res.status(StatusCodes.CREATED).json({ success: true, message: "Expense created successfully" });
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Error creating expense" });
	}
};

export const getExpense = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        const expenses = await getExpenseData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data: expenses });
    } catch (error) {
        console.error('Error getting expenses:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const updateExpense = async (req: AuthorizedRequest, res: Response) => {
    const bodyData = req.body;
    try {
        await updateExpenseData({ ...bodyData });
        return res.status(StatusCodes.OK).json({ success: true, message: 'Expense updated successfully' });
    } catch (error) {
        console.error('Error updating expense:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const deleteExpense = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req.query;
    try {
        await deleteExpenseData(_id);
        return res.status(StatusCodes.OK).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}