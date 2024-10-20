module.exports = (err,req,res,next)=>{
    err.statuscode = err.statuscode || 500;

    if(process.env.NODE_ENV === "development"){
        res.status(err.statuscode).json({
            success:false,
            message: err.message,
            stack:err.stack,
            error:err
        })
    }
    

    if(process.env.NODE_ENV === "production"){
        let message = err.message;
        let error = new Error(message)

        if(err.name === "ValidationError"){
            message = Object.values(err.errors).map(value => value.message)
            error = new Error(message);
        }

        if(err.name === "CastError"){
            message = `Resource not found: ${err.path}`
            error = new Error(message);
        }

        if(err.code === 1100){
            let message = `Duplicate ${Object.keys(err.keyValue)} error`
            error = new Error(message);
        }

        res.status(err.statuscode).json({
            success:false,
            message: error.message || 'Internal Server Srror'
        })
    }
}