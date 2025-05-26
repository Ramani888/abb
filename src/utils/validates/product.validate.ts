export const addProductValidation = {
    name: 'required|string',
    categoryId: 'required|string',
    unit: 'required|string',
    description: 'required|string',
    sku: 'required|string',
    barcode: 'required|string',
    retailPrice: 'required|numeric',
    wholesalePrice: 'required|numeric',
    purchasePrice: 'required|numeric',
    quantity: 'required|numeric',
    minStockLevel: 'required|numeric',
    taxRate: 'required|numeric',
    packingSize: 'required|string'
}
    
export const updateProductValidation = {
    _id: 'required|string'
}

export const deleteProductValidation = {
    _id: 'required|string'
}