const sendToken = (user, statusCode, res) => {

    // Create JWT token
    const token = user.getJwtToken();
    console.log(token);

    // Set cookie expiration time (defaults to 7 days if not set in the environment variables)
    const cookieExpireTime = parseInt(process.env.COOKIE_EXPIRES_TIME, 10) || 7;

    // Setting cookie options
    const options = {
        expires: new Date(Date.now() + cookieExpireTime * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // Send cookie over HTTPS in production
    };

    // Send response with token and user details
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        user
    });
};

module.exports = sendToken;
