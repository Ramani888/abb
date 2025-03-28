export interface ICustomer {
    _id?: ObjectId;
    name: string;
    address: string;
    number: number;
    email: string;
    customerType: string;
    createdAt?: Date;
    updatedAt?: Date;
}