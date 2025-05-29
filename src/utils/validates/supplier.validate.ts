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