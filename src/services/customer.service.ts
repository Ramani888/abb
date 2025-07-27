import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import { ICustomer, ICustomerPayment } from "../types/customer";
import { Order } from "../models/order.model";
import { CustomerPayment } from "../models/customerPayment.model";

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
        const customers = await Customer.find({ ownerId: ownerId, isActive: true, isDeleted: false });
        const customerIds = customers?.map(c => c?._id);

        // Fetch all orders for these customers
        const orders = await Order.find({ customerId: { $in: customerIds }, isDeleted: false });

        // Group orders by customerId
        const orderStats: Record<string, { totalOrder: number, totalSpent: number }> = {};
        orders.forEach(order => {
            const cid = order.customerId.toString();
            if (!orderStats[cid]) {
                orderStats[cid] = { totalOrder: 0, totalSpent: 0 };
            }
            orderStats[cid].totalOrder += 1;
            orderStats[cid].totalSpent += order.total || 0;
        });

        // Attach stats to each customer
        return customers.map(customer => {
            const stats = orderStats[customer._id.toString()] || { totalOrder: 0, totalSpent: 0 };
            return {
                ...customer.toObject(),
                totalOrder: stats.totalOrder,
                totalSpent: stats.totalSpent
            };
        });
    } catch (error) {
        throw error;
    }
}

export const getCustomerDetailOrderData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const customer = await Customer.findById(documentId);
        if (!customer) {
            throw new Error("Customer not found");
        }

        // Get all orders for this customer
        const orders = await Order.find({ customerId: _id, isDeleted: false });

        // Calculate total order count
        const totalOrder = orders?.length;

        // Calculate total spent (assuming each order has a 'total' field)
        const totalSpent = orders?.reduce((sum, order) => sum + (order?.total || 0), 0);

        // Find last order date (assuming each order has a 'createdAt' field)
        const lastOrderDate = orders?.length > 0
            ? new Date(Math.max(...orders
                .map(order => order?.captureDate)
                .filter((date): date is Date => date instanceof Date)
                .map(date => new Date(date).getTime())
            ))
            : null;

        return {
            ...customer.toObject(),
            orders: orders.map(order => order.toObject()),
            totalOrder,
            totalSpent,
            lastOrderDate
        };
    } catch (error) {
        throw error;
    }
}


export const getCustomerByNumberAndOwnerId = async (number: number, ownerId: string) => {
    try {
        const result = await Customer?.findOne({ number: number, ownerId: ownerId });
        return result?.toObject();
    } catch (error) {
        throw error;
    }
}

export const getCustomerById = async (_id: string) => {
    try {
        const result = await Customer?.findById(_id);
        return result?.toObject();
    } catch (error) {
        throw error;
    }
}

export const updateCustomerData = async (data: ICustomer) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());
        const result = await Customer.findByIdAndUpdate(documentId, data, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        throw error;
    }
}

export const deleteCustomerData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Customer.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        throw error;
    }
}

export const createCustomerPaymentData = async (data: ICustomerPayment) => {
    try {
        const newData = new CustomerPayment(data);
        await newData.save();
        return;
    } catch (error) {
        throw error;
    }
}

export const getCustomerPaymentData = async (ownerId: string) => {
    try {
        const result = await CustomerPayment?.aggregate([
            {
                $match: { ownerId, isDeleted: false }
            },
            {
                $lookup: {
                    from: "Customer",
                    let: { customerId: "$customerId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", { $toObjectId: "$$customerId" }] }
                            }
                        }
                    ],
                    as: "customerData"
                }
            },
            {
                $unwind: {
                    path: "$customerData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    ownerId: 1,
                    customerId: 1,
                    amount: 1,
                    paymentType: 1,
                    paymentMode: 1,
                    cardNumber: 1,
                    upiTransactionId: 1,
                    chequeNumber: 1,
                    gatewayTransactionId: 1,
                    bankReferenceNumber: 1,
                    captureDate: 1,
                    isDeleted: 1,
                    customerData: "$customerData",
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
        return result;
    } catch (error) {
        throw error;
    }
}

export const updateCustomerPaymentData = async (data: ICustomerPayment) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());

        // List of mutually exclusive fields
        const exclusiveFields = [
            "cardNumber",
            "upiTransactionId",
            "chequeNumber",
            "gatewayTransactionId",
            "bankReferenceNumber"
        ];

        // Find which field is present in the update
        const presentField = exclusiveFields.find(field => data[field as keyof ICustomerPayment]);

        // Prepare $set and $unset objects
        const setFields: any = {};
        const unsetFields: any = {};

        // Set the present field, unset the rest
        exclusiveFields.forEach(field => {
            if (field === presentField && data[field as keyof ICustomerPayment]) {
                setFields[field] = data[field as keyof ICustomerPayment];
            } else {
                unsetFields[field] = "";
            }
        });

        // Add other fields to $set
        Object.keys(data).forEach(key => {
            if (!exclusiveFields.includes(key) && key !== "_id") {
                setFields[key] = data[key as keyof ICustomerPayment];
            }
        });

        const updateObj: any = {};
        if (Object.keys(setFields).length) updateObj.$set = setFields;
        if (Object.keys(unsetFields).length) updateObj.$unset = unsetFields;

        const result = await CustomerPayment.findByIdAndUpdate(documentId, updateObj, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        throw error;
    }
}

export const deleteCustomerPaymentData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await CustomerPayment.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        throw error;
    }
}