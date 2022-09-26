const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const hashPass = async (password) => {
    // generate salt to hash password
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

const comparePass = async(password, userpassword) => {
    return await bcrypt.compare(password, userpassword);
}

const getAuthCookieExpiration = () => {
    let date = new Date();
    date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));  // 7 days
    return date;
}

const generateToken = (email) => {
    const privatekey = fs.readFileSync('./config/private.pem',{ encoding: "utf8" });
    let token = jwt.sign({email}, privatekey, {
        expiresIn: '5m',
        algorithm: 'RS256'
    });
    return token;
}

const generateRefreshToken = (email) => {
    const privatekey = fs.readFileSync('./config/refreshtoken/private.pem',{ encoding: "utf8" });
    let token = jwt.sign({email}, privatekey, {
        expiresIn: '1w',
        algorithm: 'RS256'
    });
    return token;
}


module.exports = {
    hashPass,
    comparePass,
    generateToken,
    getAuthCookieExpiration,
    generateRefreshToken
}

