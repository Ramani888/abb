export const createPurchaseOrderValidation = {
    supplierId: "required|string",
    subTotal: "required|numeric",
    totalGst: "required|numeric",
    roundOff: "required|numeric",
    total: "required|numeric",
    paymentMethod: "string",
    paymentStatus: "required|string",
    "products": "required|array",
    "products.*.productId": "required|string",
    "products.*.variantId": "required|string",
    "products.*.unit": "required|numeric",
    "products.*.carton": "required|numeric",
    "products.*.quantity": "required|numeric",
    "products.*.mrp": "required|numeric",
    "products.*.price": "required|numeric",
    "products.*.gstRate": "required|numeric",
    "products.*.gstAmount": "required|numeric",
    "products.*.total": "required|numeric"
};

export const updatePurchaseOrderValidation = {
    _id: 'required|string'
}

export const deletePurchaseOrderValidation = {
    _id: 'required|string'
}

export const getAllPurchaseOrderBySupplierIdValidation = {
    _id: 'required|string'
}