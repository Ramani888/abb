export interface IExpense {
    _id?: string;
    ownerId: string;
    userId: string;
    amount: number;
    type: string;
    paymentMode: string;
    notes?: string;
    captureDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
