import { Owner } from "../models/owner.model";
import { Permission } from "../models/permission.model";
import { Role } from "../models/role.model";
import { User } from "../models/user.model";
import { UserRole } from "../models/userRole.model";
import { UserRolePermission } from "../models/userRolePermission.model";
import { IOwner, IUser } from "../types/user";
import mongoose from "mongoose";

export const registerData = async (data: IOwner) => {
    try {
        const newData = new Owner(data);
        const saveData = await newData.save();
        return saveData?.toObject();
    } catch (error) {
        throw error;
    }
}

export const getOwnerByNumber = async (number: number) => {
    try {
        const result = await Owner?.findOne({ number: number });
        return result?.toObject();
    } catch (error) {
        throw error;
    }
}

export const getUserByNumber = async (number: number) => {
    try {
        const result = await User?.findOne({ number: number });
        return result?.toObject();
    } catch (error) {
        throw error;
    }
}

export const getUserByNumberAndOwnerId = async (ownerId: string, number: number) => {
    try {
        const result = await User?.findOne({ ownerId: ownerId, number: number });
        return result?.toObject();
    } catch (error) {
        throw error;
    }
}

export const insertUserData = async (data: IUser) => {
    try {
        const newData = new User(data);
        const savedData = await newData.save();
        return savedData?.toObject();
    } catch (error) {
        throw error;
    }
}

export const insertUserRoleData = async (userId: string, roleId: string, ownerId: string) => {
    try {
        const newData = new UserRole({ userId, roleId, ownerId });
        const savedData = await newData.save();
        return savedData?.toObject();
    } catch (error) {
        throw error;
    }
}

export const insertUserRolePermissionData = async (userId: string, roleId: string, ownerId: string, permissionId: string) => {
    try {
        const newData = new UserRolePermission({ userId, roleId, ownerId, permissionId });
        const savedData = await newData.save();
        return savedData;
    } catch (error) {
        throw error;
    }
}

export const getOwnerById = async (ownerId: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(ownerId?.toString());
        const result = await Owner?.findById({ _id: documentId });
        return result?.toObject();
    } catch (error) {
        throw error;
    }
}

export const getUserById = async (userId: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(userId?.toString());
        const result = await User?.findById({ _id: documentId });
        return result?.toObject();
    }
    catch (error) {
        throw error;
    }
}

export const getAllPermission = async () => {
    try {
        const result = await Permission?.find();
        return result?.map((item) => item?.toObject());
    } catch (error) {
        throw error;
    }
}

export const getRoleData = async () => {
    try {
        const result = await Role?.find();
        return result?.map((item) => item?.toObject());
    } catch (error) {
        throw error;
    }
}

export const getUserData = async (ownerId: string) => {
    try {
        const users = await User.aggregate([
            {
                $match: { ownerId: ownerId }
            },
            {
                $addFields: {
                    userIdStr: { $toString: "$_id" }
                }
            },
            {
                $lookup: {
                    from: "UserRole",
                    let: { userId: "$userIdStr" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { 
                                    $and: [
                                        { $eq: ["$userId", "$$userId"] },
                                        { $eq: ["$ownerId", ownerId] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userRole"
                }
            },
            {
                $unwind: {
                    path: "$userRole",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "Role", 
                    let: { roleId: "$userRole.roleId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", { $toObjectId: "$$roleId" }] }
                            }
                        }
                    ],
                    as: "roleData"
                }
            },
            {
                $unwind: {
                    path: "$roleData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    number: 1,
                    ownerId: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    roleName: { $ifNull: ["$roleData.name", ""] }
                }
            }
        ]);
        
        return users;
    } catch (error) {
        throw error;
    }
}

export const updateUserData = async (data: IUser) => {
    try {
        const documentId = new mongoose.Types.ObjectId(data?._id?.toString());
        const result = await User.findByIdAndUpdate(documentId, data, {
            new: true,
            runValidators: true
        });
        return result;
    } catch (error) {
        throw error;
    }
}

export const deleteUserData = async (_id: string) => {
    try {
        const documentId = new mongoose.Types.ObjectId(_id?.toString());
        const result = await User.findByIdAndDelete(documentId);
        return result;
    } catch (error) {
        throw error;
    }
}