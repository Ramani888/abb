import { Expense } from "../models/expense.model";
import { IExpense } from "../types/expense";
import mongoose from "mongoose";

export const createExpenseData = async (data: IExpense) => {
	try {
		const expense = new Expense(data);
		await expense.save();
		return { success: true, data: expense };
	} catch (error) {
		console.error('Error inserting expense:', error);
        throw error;
	}
};

export const getExpenseData = async (ownerId: string) => {
    try {
        const expenses = await Expense.find({ ownerId }).sort({ captureDate: -1 });
        return expenses;
    } catch (error) {
        console.error('Error fetching expenses:', error);
        throw error;
    }
};

export const updateExpenseData = async (data: IExpense) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data._id?.toString());
        const updatedExpense = await Expense.findByIdAndUpdate(documentId, data, {
            new: true,
            runValidators: true
        });
        return updatedExpense;
    } catch (error) {
        console.error('Error updating expense:', error);
        throw error;
    }
};

export const deleteExpenseData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Expense.findByIdAndDelete(documentId);
        return result;
    } catch (error) {
        console.error('Error deleting expense:', error);
        throw error;
    }
};