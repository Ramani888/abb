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