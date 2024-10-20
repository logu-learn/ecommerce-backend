const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Middleware to check if the user is authenticated
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(new ErrorHandler("Please log in to access this resource", 401));
    }

    try {
        // Verifying the token and decoding it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded:", decoded);

        // Fetching the user based on the decoded token id
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return next(new ErrorHandler("User not found", 404));
        }

        next(); // Continue if authenticated
    } catch (error) {
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
});

// Middleware to authorize specific roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            return next(new ErrorHandler(`Role '${req.user.role}' is not authorized to access this resource`, 403));
        }
        next(); // Continue if role is authorized
    };
};
