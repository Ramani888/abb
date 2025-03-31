export interface ICategory {
    _id?: string;
    ownerId: string;
    userId: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}