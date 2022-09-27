const errorHandler = (error, req, res, next) => {
    const statusCode = res.status ? res.status : 500;
    res.status(statusCode);
    console.log(error, req, res);
    return res.json({
        message: error.message,
        // stack: process.env.NODE_ENV == "production" ? null : error.stack
    });
}

module.exports = {
    errorHandler
}