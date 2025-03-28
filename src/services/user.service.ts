import { Owner } from "../models/owner.model";
import { IOwner } from "../types/user";

export const registerData = async (data: IOwner) => {
    try {
        const newData = new Owner(data);
        await newData.save();
        return;
    } catch (error) {
        throw error;
    }
}

export const getOwnerByNumber = async (number: number) => {
    try {
        const result = await Owner?.findOne({ number: number });
        return result?.toObject();
    } catch (error) {
        throw error;
    }
}