export const addProductValidation = {
    name: 'required|string',
    categoryId: 'required|string',
    description: 'required|string',
    "variants": "required|array",
    "variants.*.unit": "required|string",
    "variants.*.packingSize": "required|string",
    "variants.*.sku": "required|string",
    "variants.*.barcode": "required|string",
    "variants.*.mrp": "required|numeric",
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