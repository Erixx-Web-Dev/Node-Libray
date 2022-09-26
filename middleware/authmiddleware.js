const jwt = require('jsonwebtoken');
const User = require('../model/User')
const fs = require('fs');
const { jwtError } = require('../helper/Token-Utils');

const protect = async(req, res, next) => {
    let token;
    // if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    //     try {
    //         token =  req.headers.authorization.split(' ')[1];
    //         const publickey = fs.readFileSync('./config/public.pem',{ encoding: "utf8" });
    //         if(token) {
    //             let decoded = jwt.verify(token, publickey);
    //             let user = await User.findOne({email: decoded.email}).select('-password');
    //             if(!user) {
    //                 res.status(401)
    //                 throw new Error(`User Not Found.`)
    //             }
    //             req.user = user;
    //             next();
    //         } else {
    //             res.status(401)
    //                 throw new Error(`You dont have token authorization.`)
    //         }
    //     } catch (error) {
    //         res.status(401)
    //             throw new Error(`You dont have token authorization.`)
    //     }
    // } else {
    //     res.status(401)
    //     throw new Error(`You dont have authorization.`)
    // }
    const {auth_token} = req.cookies;

    if(auth_token) {
        try {
            token = auth_token;
            const publickey = fs.readFileSync('./config/public.pem', { encoding: "utf8" } );
            // if(token) {
                let {email} = jwt.verify(token, publickey);

                if(!email) {
                    // res.status(403)
                    // throw new Error(`Token Expired/Invalid Need to Refresh token.`);
                    let response = {message: 'You are unanthenticated.', status: 401};
                    return res.status(response.status).json({message: response.message});
                }

                let user = await User.findOne({email: email}).populate({path: 'role'}).select('-password');

                if(!user) {
                    // res.status(401);
                    // throw new Error(`User Not Found.`);
                    return res.status(401).json({message: `User Not Found.`})
                }

                req.user = user;
                next();
            // } else {
            //     res.status(401)
            //         throw new Error(`You dont have token authorization.`)
            // }
        } catch (err) {
            // let error = new Error(`You are unanthenticated.`)
            // res.status(401);
            // throw error
            let response = jwtError(err) != null ? jwtError(err) : {message: 'You are unanthenticated.', status: 401, status_code: ''};
            return res.status(response.status).json({message: response.message, status_code: response.status_code});
            // res.status(401);
            //     throw new Error(`You are unanthenticated.`);
        }
    } else {
        // let error = new Error(`You are unanthenticated.`)
        //     res.status(401);
        //     throw error
        let response = {message: 'You are unanthenticated.', status: 401, status_code: ''}; 
        return res.status(response.status).json({message: response.message, status_code: response.status_code});
        // res.status(401);
        //   throw new Error(`You are unanthenticated.`);
    }
}

module.exports = {
    protect
}