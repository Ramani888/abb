import { Customer } from "../models/customer.model";
import { ICustomer } from "../types/customer";

export const insertCustomerData = async (data: ICustomer) => {
    try {
        const newData = new Customer(data);
        await newData.save();
        return;
    } catch (error) {
        throw error;
    }
}

export const getCustomerData = async (ownerId: string) => {
    try {
        const result = await Customer?.find({ ownerId: ownerId });
        return result?.map((item) => item.toObject());
    } catch (error) {
        throw error;
    }
}

export const getCustomerByNumber = async (number: number) => {
    try {
        const result = await Customer?.findOne({ number: number });
        return result?.toObject();
    } catch (error) {
        throw error;
    }
}