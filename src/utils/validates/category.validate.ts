export const categoryValidation = {
    name: 'required|string',
    description: 'required|string',
    isActive: 'required|boolean'
}

export const updateCategoryValidation = {
    _id: 'required|string'
}

// export const getCategoryValidation = {
//     userId: 'required|string'
// }

export const deleteCategoryValidation = {
    _id: 'required|string'
}