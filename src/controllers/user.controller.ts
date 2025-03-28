import { AuthorizedRequest } from "../types/user";
import { StatusCodes } from "http-status-codes";
import { Response } from 'express';
import { getOwnerByNumber, getUserByNumberAndOwnerId, insertUserData, insertUserRoleData, insertUserRolePermissionData, registerData } from "../services/user.service";
import { comparePassword, encryptPassword } from "../utils/helpers/general";
import jwt from 'jsonwebtoken';
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

        await registerData(data);

        return res.status(StatusCodes.OK).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const login = async (req: AuthorizedRequest, res: Response) => {
    const { number, password } = req.body;
    try {
        const existingOwner = await getOwnerByNumber(Number(number));
        if (!existingOwner) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid number!' });

        if (!existingOwner?.isApproved) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Your account is not approved yet!' });
        }

        const isPasswordValid = await new Promise((resolve) =>
            comparePassword(password, String(existingOwner?.password))
            .then((result) => resolve(result))
            .catch((error) => resolve(false))
        );

        if (!isPasswordValid) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid password!' });
        }

        const SECRET_KEY: any = env.SECRET_KEY;
        const token = jwt.sign(
            { userId: existingOwner?._id?.toString(), name: existingOwner?.name },
            SECRET_KEY,
            { expiresIn: '30d' } // expires in 5 minutes
        );

        return res.status(StatusCodes.OK).send({ user: {...existingOwner, token}, success: true, message: 'Login successfully.' });

    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
}

export const insertUser = async (req: AuthorizedRequest, res: Response) => {
    try {
        const bodyData = req.body;

        const existingOwner = await getUserByNumberAndOwnerId(bodyData?.ownerId, bodyData?.number);
        if (existingOwner) return res.status(StatusCodes.BAD_REQUEST).json({ message: 'This number is already register.' });

        const user = await insertUserData(bodyData);
        await insertUserRoleData(user?._id?.toString(), bodyData?.roleId, bodyData?.ownerId);
        bodyData?.permissionIds?.map(async (permissionId: string) => {
            await insertUserRolePermissionData(user?._id?.toString(), bodyData?.roleId, bodyData?.ownerId, permissionId);
        });
        
        return res.status(StatusCodes.OK).json({ message: 'User inserted successfully' });
    } catch (error) {
        console.error('Error inserting user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error ' });
    }
}