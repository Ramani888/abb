import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { deleteUserData, getAllPermission, getOwnerById, getOwnerByNumber, getUserById, getUserByNumber, getUserByNumberAndOwnerId, getUserData, insertUserData, insertUserRoleData, insertUserRolePermissionData, registerData, updateUserData } from "../services/user.service";
import { comparePassword, encryptPassword, generateRandomPassword } from "../utils/helpers/general";
import jwt from 'jsonwebtoken';
import { RoleType } from "../utils/constants/user";
const env = process.env;

export const register = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req.body;

        const existingOwner = await getOwnerByNumber(bodyData?.number);
        if (existingOwner) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This number is already register.' });

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

        return res.status(StatusCodes.OK).send({ user: {...existingUser, token}, owner: existingOwner, success: true, message: 'Login successfully.' });

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
        await updateUserData(bodyData);
        return res.status(StatusCodes.OK).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
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