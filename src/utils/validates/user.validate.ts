import { comparePassword } from "../helpers/general"

export const registerValidation = {
    name: 'required|string',
    email: 'required|email',
    number: 'required|numeric',
    password: 'required|string',
    shopName: 'required|string',
    address: 'required|string',
    shopNumber: 'required|numeric',
    shopEmail: 'required|email',
    gst: 'required|string'
}

export const loginValidation = {
    number: 'required|numeric',
    password: 'required|string'
}

export const userInsertValidation = {
    name: 'required|string',
    email: 'required|email',
    number: 'required|numeric',
    roleId: 'required|string'
}

export const userUpdateValidation = {
    _id: 'required|string',
}

export const userUpdatePasswordValidation = {
    _id: 'required|string',
    password: 'required|string',
}

export const userUpdatePasswordByCurrentValidation = {
    _id: 'required|string',
    currentPassword: 'required|string',
    newPassword: 'required|string'
}

export const userDeleteValidation = {
    _id: 'required|string',
}