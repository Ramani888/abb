export const customerValidation = {
    name: 'required|string',
    email: 'required|email',
    number: 'required|numeric',
    address: 'required|string',
    customerType: 'required|string'
}

// export const getCustomerValidation = {
//     userId: 'required|string'
// }

export const updateCustomerValidation = {
    _id: 'required|string'
}

export const deleteCustomerValidation = {
    _id: 'required|string'
}