const errorHandler = (error, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    return res.status(statusCode).json({
        message: error.message || 'Server is has error encounter. please try again later.',
        stack: process.env.NODE_ENV == "production" ? null : error.stack
    });
}

module.exports = {
    errorHandler
}