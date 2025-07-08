import { Notification } from "../models/notification.model";
import { INotification } from "../types/notification";
import mongoose from "mongoose";

export const insertNotificationData = async (data: INotification) => {
    try {
        const newNotification = new Notification(data);
        await newNotification.save();
        return newNotification;
    } catch (error) {
        throw error;
    }
}

export const getNotificationData = async (ownerId: string) => {
    try {
        const notifications = await Notification.find({ ownerId, isDeleted: false });
        return notifications;
    } catch (error) {
        throw error;
    }
}

export const deleteNotificationData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Notification.findByIdAndUpdate(documentId, { isDeleted: true }, { new: true });
        return result;
    } catch (error) {
        throw error;
    }
}

export const updateNotificationData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await Notification.findByIdAndUpdate(documentId, {
            isRead: true
        }, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        throw error;
    }
}