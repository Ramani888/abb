import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getUserById } from "../services/user.service";
import { deleteNotificationData, getNotificationData, updateNotificationData } from "../services/notification.service";

export const getNotification = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        const notifications = await getNotificationData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error getting notifications:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const updateNotification = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req?.query;
    try {
        await updateNotificationData(_id?.toString());
        return res.status(StatusCodes.OK).json({ success: true, message: 'Notification updated successfully' });
    } catch (error) {
        console.error('Error updating notification:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const deleteNotification = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req.query;
    try {
        await deleteNotificationData(_id?.toString());
        return res.status(StatusCodes.OK).json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}