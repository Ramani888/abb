export const addProductValidation = {
    name: 'required|string',
    categoryId: 'required|string',
    unit: 'required|string',
    description: 'required|string',
    "variants": "required|array",
    "variants.*.packingSize": "required|string",
    "variants.*.sku": "required|string",
    "variants.*.barcode": "required|string",
    "variants.*.retailPrice": "required|numeric",
    "variants.*.wholesalePrice": "required|numeric",
    "variants.*.purchasePrice": "required|numeric",
    "variants.*.minStockLevel": "required|numeric",
    "variants.*.taxRate": "required|numeric",
    "variants.*.quantity": "required|numeric"
}
    
export const updateProductValidation = {
    _id: 'required|string'
}

export const deleteProductValidation = {
    _id: 'required|string'
}