const catchAsyncerror = require("../middlewares/catchAsyncerror");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwt");
const crypto = require("crypto")


exports.registerUser = catchAsyncerror(async (req,res) => {
    const {name,email,password} = req.body;

    let avatar
    if(req.file){
        avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
    }

    const user = await User.create(
        {
            name,
            email,
            password,
            avatar
        }
    )

    sendToken(user,201,res)
})

exports.loginUser = catchAsyncerror(async (req,res,next) => {
    const {email,password} = req.body;

    if(!email || !password){
        return next(new ErrorHandler("Please enter email & password",400))
    }

    //finding the user database
    const user = await User.findOne({email}).select("+password")

    if(!user){
        return next(new ErrorHandler("Invalid email or  password",401))
    }

    if(!await user.isValidPassword(password)){
        return next(new ErrorHandler("Invalid email or  password",401))
    }

    sendToken(user,201,res)
})

exports.logoutUser = async (req,res,next) => {
    res.cookie("token",null,{
        expires: new Date(Date.now()),
        httpOnly:true
        
    }).status(200).json({
        success: true,
        message: "Loggedout"
    })
}

exports.forgotPassword = catchAsyncerror(async (req,res,next) => {
    const user = await User.findOne({email: req.body.email})

    if(!user){
        return next(new ErrorHandler("User not found with this email",404))
    }

    console.log(user)
    const resetToken = user.getResetToken();
    await user.save({validationBeforeSave: false})

    //create reset url
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

    const message = `Your Password reset url is as follows \n\n 
    ${resetUrl} \n\n If you have not requested this email, then ignore it.`


    try{
        sendEmail({
            email: user.email,
            subject: "Account Password Recovery",
            message
        })

        res.status(200).json({
            success: true,
            message:`Email send to ${user.email}`
        })
    }
    catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined; 

        await user.save({validationBeforeSave: false})

        return next(new ErrorHandler(error.message,500))
    }
})

exports.resetPassword = catchAsyncerror(async(req,res,next)=>{
    const resetPasswordToken =  crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire:{
            $gt: Date.now()
        }
    })

    if(!user){
        return next(new ErrorHandler('Password reset Token Invalid or expired'))
    }

    if(req.body.password !== req.body.confirmpassword){
        return next(new ErrorHandler('Password does not match confirm password'))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({
        validateBeforeSave: false 
    })

    sendToken(user,201,res)
})

exports.getUserProfile = catchAsyncerror(async (req,res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })

})

//change password
exports.changePassword = catchAsyncerror(async (req,res) => {
    const user = await User.findById(req.user.id).select('+password');

    //check old password
    if(!await user.isValidPassword(req.body.oldPassword)){
        return next(new ErrorHandler('Old password is incorrect'))
    }

    //assining new password
    user.password = req.body.password
    await user.save();

    res.status(200).json({
        success: true
    })
})

exports.updateProfile = catchAsyncerror(async (req,res) => {
    let newUserData = {
        name: req.body.name,  
        email: req.body.email
    }

    let avatar
    if(req.file){
        avatar = `${process.env.BACKEND_URL}/uploads/user/${req.file.originalname}`
        newUserData = {...newUserData,avatar}
    }
    console.log("updated data:",newUserData.name);
    

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new: true,
        runValidators:true
    })
    res.status(200).json({
        success: true,
        user
    })

    sendToken(user,201,res)

})