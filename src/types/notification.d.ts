export interface INotification {
    _id?: string;
    ownerId: string;
    userId: string;
    name: string;
    description: string;
    type: 'order' | 'stock' | 'payment' | 'system';
    link?: string;
    captureDate?: Date;
    isRead?: boolean;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}