const products = require('../data/products.json')
const Product = require('../models/productModel')
const connectDatabase = require('../config/database.js');

connectDatabase()

const seedProducts = async()=>{
    try{
        await  Product.deleteMany()
        console.log('Product Deleted!')
        await  Product.insertMany(products)
        console.log('All product added!')
    }
    catch(err){
        console.log(err.message)
    }
    process.exit();
}

seedProducts();