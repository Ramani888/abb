export const addSupplierValidation = {
    name: 'required|string',
    number: 'required|numeric',
    email: 'email',
    address: 'string',
    gstNumber: 'string',
    captureDate: 'date'
}

export const updateSupplierValidation = {
    _id: 'required|string'
}

export const deleteSupplierValidation = {
    _id: 'required|string'
}

export const getSupplierDetailOrderValidation = {
    _id: 'required|string'
}

export const supplierPaymentValidation = {
    supplierId: 'required|string',
    amount: 'required|numeric',
    paymentType: 'required|string',
    paymentMode: 'required|string'
}

export const updateSupplierPaymentValidation = {
    _id: 'required|string'
}

export const deleteSupplierPaymentValidation = {
    _id: 'required|string'
}