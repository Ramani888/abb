export const expenseValidation = {
	captureDate: 'required|date',
    amount: 'required|numeric|min:0',
    type: 'required|string',
    paymentMode: 'required|string'
};

export const updateExpenseValidation = {
    _id: 'required|string'
}

export const deleteExpenseValidation = {
    _id: 'required|string'
}
