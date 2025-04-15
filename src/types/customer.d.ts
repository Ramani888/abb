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
    createdAt?: Date;
    updatedAt?: Date;
}