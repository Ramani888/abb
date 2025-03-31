import express from "express";
import { validateBody } from "../middleware/bodyValidate.middleware";
import { shopValidation } from "../utils/validates/shop.validate";
import { insertShop } from "../controllers/shop.controller";
import { loginValidation, registerValidation, userDeleteValidation, userInsertValidation, userUpdateValidation } from "../utils/validates/user.validate";
import { deleteUser, getUser, insertUser, login, register, updateUser } from "../controllers/user.controller";
import { customerValidation, deleteCustomerValidation, updateCustomerValidation } from "../utils/validates/customer.validate";
import { deleteCustomer, getCustomer, insertCustomer, updateCustomer } from "../controllers/customer.controller";
import { authenticateToken } from "../utils/helpers/general";
import { categoryValidation, deleteCategoryValidation, updateCategoryValidation } from "../utils/validates/category.validate";
import { deleteCategory, getCategory, insertCategory, updateCategory } from "../controllers/category.controller";

enum RouteSource {
    Body,
    Query,
    Params
}

const router = express.Router();

//Demo Request
router.post('/shop', validateBody(shopValidation), (req, res, next) => {
	insertShop(req, res).catch(next);
});

//Auth
router.post('/register', validateBody(registerValidation), (req, res, next) => {
	register(req, res).catch(next);
});

router.post('/login', validateBody(loginValidation), (req, res, next) => {
	login(req, res).catch(next);
})

//Customers
router.post('/customer', authenticateToken, validateBody(customerValidation), (req, res, next) => {
	insertCustomer(req, res).catch(next);
})

router.get('/customer', authenticateToken, (req, res, next) => {
	getCustomer(req, res).catch(next);
})

router.put('/customer', authenticateToken, validateBody(updateCustomerValidation), (req, res, next) => {
	updateCustomer(req, res).catch(next)
})

router.delete('/customer', authenticateToken, validateBody(deleteCustomerValidation, RouteSource?.Query), (req, res, next) => {
	deleteCustomer(req, res).catch(next)
})

//Users
router.post('/user', authenticateToken, validateBody(userInsertValidation), (req, res, next) => {
	insertUser(req, res).catch(next);
})

router.get('/user', authenticateToken, (req, res, next) => {
	getUser(req, res).catch(next);
})

router.put('/user', authenticateToken, validateBody(userUpdateValidation), (req, res, next) => {
	updateUser(req, res).catch(next);
})

router.delete('/user', authenticateToken, validateBody(userDeleteValidation, RouteSource?.Query), (req, res, next) => {
	deleteUser(req, res).catch(next);
})

// Category
router.post('/category', authenticateToken, validateBody(categoryValidation), (req, res, next) => {
	insertCategory(req, res).catch(next);
})

router.put('/category', authenticateToken, validateBody(updateCategoryValidation), (req, res, next) => {
	updateCategory(req, res).catch(next);
})

router.get('/category', authenticateToken, (req, res, next) => {
	getCategory(req, res).catch(next);
});

router.delete('/category', authenticateToken, validateBody(deleteCategoryValidation, RouteSource?.Query), (req, res, next) => {
	deleteCategory(req, res).catch(next);
});
export default router;