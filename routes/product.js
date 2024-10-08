const express = require('express');
const { getproducts, newProduct,getsingleproduct, updateproduct, deleteproduct, createReview, getReviews, deleteReview } = require('../controllers/productControllers');
const router = express.Router();
const {isAuthenticatedUser, authorizeRoles} = require("../middlewares/authenticate")


router.route('/products').get(getproducts);
router.route('/product/new').post(isAuthenticatedUser,authorizeRoles('admin'),newProduct);
router.route('/product/:id').get(getsingleproduct).put(updateproduct).delete(deleteproduct);

router.route('/review').put(isAuthenticatedUser,createReview);
router.route('/reviews').get(getReviews).delete(deleteReview);

module.exports = router; 