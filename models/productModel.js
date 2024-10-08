const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter product name"],
        trim:true,
        maxLength:[100,"Product name cannot exceed the 100 characters"]
    },
    price:{
        type:Number,
        default:0.0
    },
    description:{
        type:String,
        required:[true,"Please Enter product description"]
    },
    ratings:{
        type:String,
        default:0
    },
    images:[
        {
            image:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"Please enter product category"],
        enum:{
            values:[
                'Electronics',
                'Mobile Phones',
                'Headphones',
                'Laptops',
                'Accessories',
                'Food',
                'Books',
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'
            ],
            message:'Please select correct Category'
        }
    },
    seller:{
        type:String,
        required: [true,"Please enter product Seller"]
    },
    stock:{
        type:Number,
        maxLength:[20,"Product stock cannot exceed the 20"]
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user: mongoose.Schema.Types.ObjectId,
            rating:{
                type:String,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        } 
    ],
    user:{
        type: mongoose.Schema.Types.ObjectId
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})


let schema = mongoose.model('Product',productSchema);

module.exports = schema;