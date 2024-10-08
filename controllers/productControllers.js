const Product= require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../middlewares/catchAsyncError');
const APIFeatures = require('../utils/apiFeatures');
// const { resolve } = require('path');

// Get all the products - /products
exports.getproducts = async (req,res,next) => {
    const resPerPage = 3;

    let buildQuery = ()=>{
        return new APIFeatures(Product.find(),req.query).search().filter();
    }
    const products = await buildQuery().paginate(resPerPage).query;

    const filteredProductsCount = await buildQuery().query.countDocuments({})
    const totalProductsCount = await Product.countDocuments({});
    let productsCount = totalProductsCount;

    if(filteredProductsCount !== totalProductsCount){
        productsCount = filteredProductsCount
    }

    await new Promise(resolve => setTimeout(resolve,300))
    
    res.status(200).json({
        success : true,
        count: productsCount,
        resPerPage,
        products
    })
}

// Create a new product - /product/new
exports.newProduct = catchAsyncError(async(req,res,next) => {

    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    })
})

// Get single product - /product/:id
exports.getsingleproduct = async (req,res,next) => {
    const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not Found Test",404))
    }

    res.status(201).json({
        success:true,
        product
    })
}


// Update product - /product/:id
exports.updateproduct = async (req,res,next) => {
    let product = await Product.findById(req.params.id);
    if(!product){
        res.status(404).json({
            success:false,
            message:"Product no found"
        })
    }

    product =await Product.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true
    })

    res.status(201).json({
        success:true,
        product
    })
}

// delete product - /product/:id
exports.deleteproduct = async (req,res,next) => {
    let product = await Product.findById(req.params.id);
    if(!product){
        res.status(404).json({
            success:false,
            message:"Product no found"
        })
    }

    await product.deleteOne();

    res.status(201).json({
        success:true,
        message: "Product Deleted!"
    })
}

//Create Review - api/v1/review
exports.createReview = catchAsyncError(async(req,res,next)=>{
    const {productId,rating,comment} = req.body;

    const review = {
        user: req.user.id,
        rating,
        comment
    }

    const product = await Product.findById(productId)

    //user review exists
    const isReviewed = product.reviews.find(review=>{
        return review.user.toString() === req.user.id.toString()
    })

    //Updating the Review
    if(isReviewed){
        product.reviews.forEach(review =>{
            if(review.user.toString() === req.user.id.toString()){
                review.comment = comment
                review.rating = rating
            }
        })
    }else{
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length;
    }

    // find the Average Ratings of the product reviews
    product.ratings = product.reviews.reduce((acc,review)=>{
        return review.rating + acc
    },0) / product.reviews.length;

    product.ratings = isNaN(product.ratings) ? 0 : product.ratings;

    await product.save({validateBeforeSave: false})

    res.status(200).json({
        success:true
    })
})

//Get Reviews - api/v1/reviews?id={productId}
exports.getReviews = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.id)

    res.status(200).json({
        success:true,
        reviews: product.reviews
    })
})

//Delete Review - api/v1/reviews?id={productId}
exports.deleteReview = catchAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId)

    //filtering the reviews which does not match the deleting the review id
    const reviews = product.reviews.filter((review)=>{
        return review._id.toString() !== req.query.id.toString()
    })

    const numOfReviews = reviews.length;

    //finding the average rating with the filtered reviews
    let ratings = product.reviews.reduce((acc,review)=>{
        return review.rating + acc
    },0) / reviews.length;

    ratings = isNaN(ratings) ? 0 : ratings;

    // save the product document 
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        numOfReviews,
        ratings
    })
    res.status(200).json({
        success:true,
    })
})
