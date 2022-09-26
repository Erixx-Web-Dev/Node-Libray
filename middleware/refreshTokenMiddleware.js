const jwt = require('jsonwebtoken');
const User = require('../model/User')
const fs = require('fs');
const { generateRefreshToken, generateToken } = require('../helper/IndexHelper');

const refreshAthorization = async (req, res) => {
    try {
        const {refresh_token} = req.cookies;
    
        if(!refresh_token) {
            res.status(401)
                throw new Error(`You are unanthenticated 1.`)
        }

        const publickey = fs.readFileSync('./config/refreshtoken/public.pem', { encoding: "utf8" } );

        let {email} = jwt.verify(refresh_token, publickey);

        if(!email) {
            res.status(401)
                throw new Error(`Token Invalid Cannot to Issue New.`);
        }

        let user = await User.findOne({email: email}).select('-password');

        if(!user) {
            res.status(401)
                throw new Error(`Token Invalid Cannot to Issue New.`);
        }

        const token = generateToken(email);

        res.cookie('auth_token', token, {
            // expires: new Date(Date.now() + (1000 * 60 * 60 * 1)), // 1h hr automatic in browser delete when expired
            maxAge: 1 * 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            path: '/',
            sameSite: 'lax'
        });

        return res.json({message: 'Token Refresh Success.'});

    } catch (error) {
        console.log(error)
        res.status(401)
            throw new Error(`You are unanthenticated 2.`)
    }
}

module.exports = {
    refreshAthorization
}