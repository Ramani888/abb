import express from "express";
import { validateBody } from "../middleware/bodyValidate.middleware";
import { shopValidation } from "../utils/validates/shop.validate";
import { insertShop } from "../controllers/shop.controller";
import { loginValidation, registerValidation, userGetValidation, userInsertValidation } from "../utils/validates/user.validate";
import { getUser, insertUser, login, register } from "../controllers/user.controller";
import { customerValidation, getCustomerValidation } from "../utils/validates/customer.validate";
import { getCustomer, insertCustomer } from "../controllers/customer.controller";
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

//Users
router.post('/user', authenticateToken, validateBody(userInsertValidation), (req, res, next) => {
	insertUser(req, res).catch(next);
})

router.get('/user', authenticateToken, validateBody(userGetValidation, RouteSource?.Query), (req, res, next) => {
	getUser(req, res).catch(next);
})

export default router;