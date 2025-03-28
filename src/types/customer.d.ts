export interface ICustomer {
    _id?: ObjectId;
    ownerId: string;
    userId: string;
    name: string;
    address: string;
    number: number;
    email: string;
    customerType: string;
    createdAt?: Date;
    updatedAt?: Date;
}