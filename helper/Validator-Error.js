const {validationResult} = require('express-validator');

const handleErrors = (req, res, next) => {
    // console.log(req.body);
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }
    next();
}

module.exports = {
    handleErrors
} 