export const createOrderValidation = {
    customerType: "required|string",
    customerId: "required|string",
    subTotal: "required|numeric",
    totalGst: "required|numeric",
    roundOff: "required|numeric",
    total: "required|numeric",
    paymentMethod: "required|string",
    paymentStatus: "required|string",
    "products": "required|array",
    "products.*.productId": "required|string",
    "products.*.quantity": "required|numeric",
    "products.*.price": "required|numeric",
    "products.*.gst": "required|numeric",
    "products.*.gstAmount": "required|numeric",
    "products.*.total": "required|numeric"
};

export const updateOrderValidation = {
    _id: 'required|string'
}

export const deleteOrderValidation = {
    _id: 'required|string'
}