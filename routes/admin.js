// const path = require('path');

const express = require('express');
const expValidator = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/...
router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/add-product', [
  expValidator.body('title')
  .isString()
  .isLength({ min:2, max: 64 })
  .trim(),
  expValidator.body('price')
  .isFloat(),
  expValidator.body('description')
  .isLength({ min:3, max: 300 })
  .trim()
], isAuth, adminController.postAddProduct);

router.post('/edit-product', [
  expValidator.body('title')
  .isString()
  .isLength({ min:2, max: 64 })
  .trim(),
  expValidator.body('price')
  .isFloat(),
  expValidator.body('description')
  .isLength({ min:3, max: 300 })
  .trim()
], isAuth, adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;