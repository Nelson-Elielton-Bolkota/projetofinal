const express = require('express');
const router = express.Router();
const { searchProducts } = require('../controllers/products');
const {
  createProduct,
  getProducts,
  getProductsByCategory,
  updateProduct,
  deleteProduct
} = require('../controllers/products');


router.post('/', createProduct);
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/search', searchProducts);  

module.exports = router;