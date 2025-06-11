export interface ISupplier {
    _id?: string;
    ownerId: string;
    userId: string;
    name: string;
    number: string;
    email?: string;
    address?: string;
    gstNumber?: string;
    captureDate?: Date;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISupplierPayment {
    _id?: ObjectId;
    ownerId: string;
    userId: string;
    supplierId: string;
    amount: number;
    paymentType: string; // e.g., 'cash', 'credit', 'debit'
    paymentMode: string; // e.g., 'online', 'offline'
    captureDate?: Date;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}