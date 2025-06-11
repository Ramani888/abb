export interface ICustomer {
    _id?: ObjectId;
    ownerId: string;
    userId: string;
    name: string;
    address: string;
    number: number;
    email: string;
    customerType: string;
    gstNumber?: string;
    creditLimit?: number;
    paymentTerms?: string;
    captureDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ICustomerPayment {
    _id?: ObjectId;
    ownerId: string;
    userId: string;
    customerId: string;
    amount: number;
    paymentType: string; // e.g., 'cash', 'credit', 'debit'
    paymentMode: string; // e.g., 'online', 'offline'
    captureDate?: Date;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}