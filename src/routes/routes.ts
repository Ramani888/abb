import express from "express";
import { validateBody } from "../middleware/bodyValidate.middleware";
import { shopValidation } from "../utils/validates/shop.validate";
import { insertShop } from "../controllers/shop.controller";
import { loginValidation, registerValidation, userGetValidation, userInsertValidation, userUpdateValidation } from "../utils/validates/user.validate";
import { deleteUser, getUser, insertUser, login, register, updateUser } from "../controllers/user.controller";
import { customerValidation, deleteCustomerValidation, getCustomerValidation, updateCustomerValidation } from "../utils/validates/customer.validate";
import { deleteCustomer, getCustomer, insertCustomer, updateCustomer } from "../controllers/customer.controller";
import { authenticateToken } from "../utils/helpers/general";

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

router.get('/customer', authenticateToken, validateBody(getCustomerValidation, RouteSource?.Query), (req, res, next) => {
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

router.get('/user', authenticateToken, validateBody(userGetValidation, RouteSource?.Query), (req, res, next) => {
	getUser(req, res).catch(next);
})

router.put('/user', authenticateToken, validateBody(userUpdateValidation), (req, res, next) => {
	updateUser(req, res).catch(next);
})

router.delete('/user', authenticateToken, validateBody(userUpdateValidation, RouteSource?.Query), (req, res, next) => {
	deleteUser(req, res).catch(next);
})

export default router;