import express from "express";
import { validateBody } from "../middleware/bodyValidate.middleware";
import { shopValidation } from "../utils/validates/shop.validate";
import { insertShop } from "../controllers/shop.controller";
import { loginValidation, registerValidation } from "../utils/validates/user.validate";
import { login, register } from "../controllers/user.controller";
import { customerValidation } from "../utils/validates/customer.validate";
import { insertCustomer } from "../controllers/customer.controller";
import { authenticateToken } from "../utils/helpers/general";

const router = express.Router();

//Demo Request
router.post('/shop', validateBody(shopValidation), (req, res, next) => {
	insertShop(req, res).catch(next);
});

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

export default router;