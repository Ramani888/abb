import { Shop } from "../models/shop.model";
import { IShop } from "../types/shop";

export const insertShopData = async (shopData: IShop) => {
    try {
        const newData = new Shop(shopData);
        await newData.save();
        return;
    } catch (error) {
        throw error;
    }
}