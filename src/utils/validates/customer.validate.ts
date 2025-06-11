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

export const getCustomerDetailOrderValidation = {
    _id: 'required|string'
}

export const customerPaymentValidation = {
    customerId: 'required|string',
    amount: 'required|numeric',
    paymentType: 'required|string',
    paymentMode: 'required|string'
}

export const updateCustomerPaymentValidation = {
    _id: 'required|string'
}

export const deleteCustomerPaymentValidation = {
    _id: 'required|string'
}