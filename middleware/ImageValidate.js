const imageValidate = (req, res, next) => {

    console.log(req.file);
    next();
}


module.exports = {
    imageValidate
}