export const customerValidation = {
    userId: 'required|string',
    name: 'required|string',
    email: 'required|email',
    number: 'required|numeric',
    address: 'required|string',
    customerType: 'required|string'
}

export const getCustomerValidation = {
    userId: 'required|string'
}