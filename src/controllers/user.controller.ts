import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { deleteUserData, deleteUserRolePermissionData, getAllPermission, getOwnerById, getOwnerByNumber, getRoleData, getUserById, getUserByNumber, getUserByNumberAndOwnerId, getUserData, getUserRolePermissionData, insertUserData, insertUserRoleData, insertUserRolePermissionData, registerData, updateOwnerData, updateUserData, updateUserRoleData } from "../services/user.service";
import { comparePassword, encryptPassword, generateRandomPassword } from "../utils/helpers/general";
import jwt from 'jsonwebtoken';
import { RoleType } from "../utils/constants/user";
import { get } from "mongoose";
const env = process.env;

export const register = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req.body;

        const existingOwner = await getOwnerByNumber(bodyData?.number);
        if (existingOwner) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This number is already register as a owner.' });

        //Encrypt Password
        const newPassword = await encryptPassword(bodyData?.password)
        bodyData.password = newPassword;

        const data = {
            number: bodyData?.number,
            password: bodyData?.password,
            name: bodyData?.name,
            email: bodyData?.email?.toLowerCase(),
            shop: {
                name: bodyData?.shopName,
                address: bodyData?.address,
                number: bodyData?.shopNumber,
                email: bodyData?.shopEmail?.toLowerCase(),
                gst: bodyData?.gst
            }
        }

        const owner = await registerData(data);

        const userData = {
            name: bodyData?.name,
            number: bodyData?.number,
            email: bodyData?.email?.toLowerCase(),
            ownerId: owner?._id?.toString(),
            password: newPassword as string
        };

        const existingUser = await getUserByNumberAndOwnerId(userData?.ownerId ?? '', bodyData?.number);
        if (existingUser) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This number is already register as a user.' });

        const user = await insertUserData(userData);
        const role = await insertUserRoleData(user?._id?.toString(), RoleType?.Administrator, owner?._id?.toString());
        const allPermission = await getAllPermission();
        allPermission?.map(async (permission) => {
            await insertUserRolePermissionData(user?._id?.toString(), role?._id?.toString(), owner?._id?.toString(), permission?._id?.toString());
        });

        return res.status(StatusCodes.OK).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const login = async (req: AuthorizedRequest, res: Response) => {
    const { number, password } = req.body;
    try {
        const existingUser = await getUserByNumber(Number(number));
        if (!existingUser) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid number!' });

        const existingOwner = await getOwnerById(existingUser?.ownerId);

        if (!existingOwner?.isApproved) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Your account is not approved yet!' });
        }

        const isPasswordValid = await new Promise((resolve) =>
            comparePassword(password, String(existingUser?.password))
            .then((result) => resolve(result))
            .catch((error) => resolve(false))
        );

        if (!isPasswordValid) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid password!' });
        }

        const SECRET_KEY: any = env.SECRET_KEY;
        const token = jwt.sign(
            { userId: existingUser?._id?.toString(), name: existingUser?.name },
            SECRET_KEY,
            { expiresIn: '30d' } // expires in 5 minutes
        );

        const permissionData = await getUserRolePermissionData(existingUser?.ownerId, existingUser?._id?.toString());

        return res.status(StatusCodes.OK).send({ user: {...existingUser, token, permissionData}, owner: existingOwner, success: true, message: 'Login successfully.' });

    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const insertUser = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req.body;
        const { userId } = req.user;
        const userData = await getUserById(userId);

        const existingUser = await getUserByNumberAndOwnerId(userData?.ownerId ?? '', bodyData?.number);
        if (existingUser) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This number is already register.' });

        const randomPassword = generateRandomPassword();
        const newPassword = await encryptPassword(randomPassword);

        const user = await insertUserData({...bodyData, password: newPassword, ownerId: userData?.ownerId});
        await insertUserRoleData(user?._id?.toString(), bodyData?.roleId, userData?.ownerId ?? '');
        bodyData?.permissionIds?.map(async (permissionId: string) => {
            await insertUserRolePermissionData(user?._id?.toString(), bodyData?.roleId, userData?.ownerId ?? '', permissionId);
        });
        
        return res.status(StatusCodes.OK).json({ message: 'User inserted successfully' });
    } catch (error) {
        console.error('Error inserting user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error ' });
    }
}

export const getUser = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        const data = await getUserData(userData?.ownerId ?? '');
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error getting user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const updateUser = async (req: AuthorizedRequest, res: Response) => {
    const bodyData = req.body;
    try {
        const { userId } = req.user;
        const userData = await getUserById(bodyData?._id);
        const ownerData = await getOwnerById(userData?.ownerId ?? '');

        // Check if another user with the same number exists (excluding current user)
        const existingUser = await getUserByNumberAndOwnerId(userData?.ownerId ?? '', bodyData?.number);
        if (existingUser && existingUser._id.toString() !== bodyData._id) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This number is already registered.' });
        }

        // Update user data
        await updateUserData(bodyData);

        // Update owner data if the number or email has changed
        if (Number(ownerData?.number) === Number(userData?.number)) {
            await updateOwnerData({ ...ownerData, name: bodyData?.name, number: bodyData?.number, email: bodyData?.email });
        }

        // Prepare async operations for role and permissions
        const ops: Promise<any>[] = [];

        if (bodyData?.roleId) {
            ops.push(updateUserRoleData(userData?.ownerId ?? '', bodyData._id, bodyData.roleId));
        }

        if (Array.isArray(bodyData?.permissionIds)) {
            // Remove old permissions and add new ones
            ops.push(
                deleteUserRolePermissionData(userData?.ownerId ?? '', bodyData._id)
                    .then(() =>
                        Promise.all(
                            bodyData.permissionIds.map((permissionId: string) =>
                                insertUserRolePermissionData(bodyData._id, bodyData.roleId, userData?.ownerId ?? '', permissionId)
                            )
                        )
                    )
            );
        }

        await Promise.all(ops);

        // Fetch updated permissions
        const permissionData = await getUserRolePermissionData(userData?.ownerId ?? '', bodyData._id);

        return res.status(StatusCodes.OK).json({ success: true, message: 'User updated successfully', permissionData });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const updateUserPassword = async (req: AuthorizedRequest, res: Response) => {
    const { _id, password } = req.body;
    try {
        const userData = await getUserById(_id);
        const ownerData = await getOwnerById(userData?.ownerId ?? '');
        const newPassword = await encryptPassword(password);
        await updateUserData({ _id, password: newPassword as string });
        // Update owner data if the pssword has changed
        if (Number(ownerData?.number) === Number(userData?.number)) {
            await updateOwnerData({ ...ownerData, password: newPassword as string });
        }
        return res.status(StatusCodes.OK).json({ message: 'User password updated successfully' });
    } catch (error) {
        console.error('Error updating user password:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const updateUserPasswordByCurrent = async (req: AuthorizedRequest, res: Response) => {
    const { _id, currentPassword, newPassword } = req.body;
    try {
        const existingUser = await getUserById(_id);
        const ownerData = await getOwnerById(existingUser?.ownerId ?? '');

        if (!existingUser) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'User not found' });
        
        const isPasswordValid = await new Promise((resolve) =>
            comparePassword(currentPassword, String(existingUser?.password))
            .then((result) => resolve(result))
            .catch((error) => resolve(false))
        );

        if (!isPasswordValid) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid current password!' });
        }

        const password = await encryptPassword(newPassword);
        await updateUserData({ _id, password: password as string });
        // Update owner data if the pssword has changed
        if (Number(ownerData?.number) === Number(existingUser?.number)) {
            await updateOwnerData({ ...ownerData, password: password as string });
        }
        
        return res.status(StatusCodes.OK).json({ success: true, message: 'User password updated successfully' });
    } catch (error) {
        console.error('Error updating user password:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const deleteUser = async (req: AuthorizedRequest, res: Response) => {
    const { _id } = req?.query;
    try {
        await deleteUserData(_id);
        return res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const getPermission = async (req: AuthorizedRequest, res: Response) => {
    try {
        const permissionData = await getAllPermission();
        return res.status(StatusCodes.OK).json({ success: true, data: permissionData });
    } catch (error) {
        console.error('Error getting permission:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const getRole = async (req: AuthorizedRequest, res: Response) => {
    try {
        const data = await getRoleData();
        return res.status(StatusCodes.OK).json({ success: true, data: data });
    } catch (err) {
        console.error('Error getting permission:', err);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const getUserRolePermission = async (req: AuthorizedRequest, res: Response) => {
    const { userId } = req.user;
    try {
        const userData = await getUserById(userId);
        const data = await getUserRolePermissionData(userData?.ownerId ?? '', userId);
        return res.status(StatusCodes.OK).json({ success: true, data });
    } catch (error) {
        console.error('Error getting user role permission:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}