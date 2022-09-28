const {UserClass} = require('../class/UserClass');
const {RoleClass} = require('../class/RoleClass');
const { base64_encode_image } = require('../helper/ImageToBase64');
const { hashPass, comparePass, generateToken, generateRefreshToken } = require('../helper/IndexHelper');
const { removeTokens } = require('../helper/AuthHelper');
const isBase64 = require('is-base64');
const { sendEmailRegister, sendEmailResetLink } = require('../helper/Mailer');
const mongoose = require('mongoose');
const { generateTokenResetPass } = require('../helper/Token-Utils');
const { calDiffISODate } = require('../helper/DateTime');

const RegisterUser = async (req, res) => {
    try {
        
        const role = !req?.body?.role ? await RoleClass.roleUser() : req.body.role;
        if(!role) {
            return res.status(400).json({message: 'Server encounter error. please try again later.'});
        }
        if(await UserClass.findByEmailUser(req.body.email)) {
            return res.status(400).json({message: 'Email is already use. please use different email.'});
        }
        const data = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            middlename: req.body.middlename,
            email: req.body.email,
            password: await hashPass(req.body.password),
            details: {
               avatar: req.body.avatar,
               phone: req.body.phone, 
            },
            role: [role]
        }
        let response = await UserClass.register(data);
        if(!response) {
            return res.status(400).json({message: 'Register Failed'});
        }
        return res.status(200).json({message: 'Register Complete'});
    } catch (error) {
        return res.status(500).json({message: 'Registration Failed. Server Error.', error_details:{...error}});
    }
}


const checkEmailResetPass = async(req, res) => {
    try {
        const {email} = req.body;
        let userResponse = await UserClass.findByEmailUser(email);

        if(userResponse) {
            // create token for front end validation
            let tokenvalue = generateTokenResetPass(20);
            // push token value  }
            let response = await UserClass.createToken(userResponse._id, tokenvalue);
            let link = `https://library-system-react.vercel.app/reset-password/${response.email}/${tokenvalue}`
            let senEmail = await sendEmailResetLink(response.email, 'librarysystem@gmail.com', "Password Reset Link", response, link);

            return res.status(200).json({message: 'Request Success. Link was send in your email.'});
        }

        return res.status(400).json({message: 'Request Failed Email Invalid. Try Again.'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Reset Password request Failed. Server Error.', error_details:{...error}});
    }
}


const processResetPass = async(req, res) => {
    try {

        const {email, token, password} = req.body;
        let userResponse = await UserClass.findByEmailUser(email);
        if(!userResponse) {
            return res.status(400).json({message: 'Invalid email.'});
        }

        if(!userResponse.token.value) {
            return res.status(400).json({message: 'No Token Generate for this request.'});
        }

        if(userResponse.token.value != token) {
            return res.status(400).json({message: 'Token Invalid.'});
        }
        let date = new Date();
        let start =  date.toISOString('en-Us', {timeZone: 'Asia/Manila'});
        let end = userResponse.token.expires;
        let {minutes} = calDiffISODate(start, end)
        if(minutes >= 5) {
            await UserClass.revokeToken(userResponse._id);
            return res.status(400).json({message: 'Token Expires. sorry you can request again.'});
        }

        let newPass = await hashPass(password);
        const data = {
            password: newPass
        }
        let response = await UserClass.updateProfile(userResponse._id, data);

        if(response) {
            await UserClass.revokeToken(userResponse._id);
            return res.status(200).json({message: 'Password Reset Complete. You can login now.'});
        }
        
        return res.status(400).json({message: 'Request Failed Email Invalid. Try Again.'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: 'Reset Password request Failed. Server Error.', error_details:{...error}});
    }
}


const RegisterNewUser = async (req, res) => {
    try {
        // const session = mongoose.startSession()
        if(await UserClass.findByEmailUser(req.body.email)) {
            return res.status(400).json({message: 'Email is already use. please use different email.'});
        }
        const data = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            middlename: req.body.middlename,
            email: req.body.email,
            password: await hashPass(req.body.password),
            details: {
               avatar: req.body.avatar,
               phone: req.body.phone, 
            },
            role: [req.body.role]
        }
        let response = await UserClass.register(data);
        let sendemail = await sendEmailRegister(req.body.email, 'librarysystem@gmail.com', 'User Registration', response, req.body.password);

        if(!sendemail) {
            await UserClass.userRollback(response._id);
            return res.status(400).json({message: 'Register Failed. Server Email Send Error.'});
        }

        if(!response) {
            return res.status(400).json({message: 'Register Failed'});
        }
        return res.status(200).json({message: 'Register User Complete'});
    } catch (error) {
        return res.status(500).json({message: 'Registration Failed. Server Error.', error_details:{...error}});
    }
}


const LoginUser = async (req, res) => {
    try {
        const user = await UserClass.findByEmailUserAuth(req.body.email);
  
        if(!user) {
            return res.status(400).json({message: 'Invalid credentials.'});
        }
        if(!await comparePass(req.body.password, user.password)) {
            return res.status(400).json({message: 'Invalid credentials.'});
        }
        const token = generateToken(user.email); // token expires will use for refresh token or validate the error
        const refreshtoken = generateRefreshToken(user.email);
        user.password = undefined;
         
        // let date = new Date().toLocaleString('en-US', {timeZone: 'America/Los_Angeles'});
        let date = new Date();
        return  res.status(200)
                .cookie('auth_token', token, {
                    // expires: new Date(Date.now() + (1000 * 60 * 60 * 1)), // 1h hr automatic in browser delete when expired
                    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
                    secure: process.env.NODE_ENV !== "development",
                    httpOnly: true,
                    // path: '/',
                    sameSite: 'None'
                    // sameSite: 'lax' 
                })
                .cookie('refresh_token', refreshtoken, {
                    // maxAge: '1d', // 1d automatic in browser delete when expired -> 3hrs
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    secure: process.env.NODE_ENV !== "development",
                    httpOnly: true,
                    // path: '/',
                    sameSite: 'None'
                    // sameSite: 'lax'
                })
                .json({message: 'Sign In Success.', user});

    } catch (error) {
        return res.status(500).json({message: 'Sign In Failed. Server Error.', error_details:{...error}});
        // throw new Error('Sign In Failed. Server Error.');
    }
}

const LogOutUser = (req, res) => {
    try {
        removeTokens(req, res)
        return res.status(200).json({message: 'Logout Complete'});
    } catch (error) {
        removeTokens(req, res);
        return res.status(500).json({message: 'Logout Failed. Server Error.', error_details:error});
        // throw new Error('Logout Failed. Server Error.');
    }
}


const dashBoardDatas = async (req, res) => {
    try {
        let users = await UserClass.getAllUsers('User');
        let librarians = await UserClass.getAllUsers('Librarian');
        return res.status(200).json({message: 'Request Complete', users, librarians});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Server Error.', error_details: error});
    }
}


const autheticate = (req, res) => {

}

const SearchUsers = async (req, res) => {
    try {
        const {search} = req.body;
        let users = await UserClass.userSearching(search, 'User');
        return res.status(200).json({message: 'User Search Complete', users});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Server Error.', error_details: error});
    }
}

const fetchUser = async(req, res) => {
    const {user_id} = req.params;
    try {
        let user = await UserClass.userFindById(user_id);
        return res.status(200).json({message: 'User Fetch Complete', user});
    } catch (error) {
        return res.status(500).json({message: 'Server Error.', error_details: {...error}});
    }
    
}

const ListUsers = async (req, res) => {
    try {
        let pageNumber = parseInt(req?.query?.page) || 1;
        const searchInput = {
            fullname: req?.query?.fullname || '',
            email: req?.query?.email || '',
        }

        let limit = 2;
        let users = await UserClass.users(pageNumber, limit, searchInput);
        return res.status(200).json({message: 'User List Request Complete', users});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Server Error.', error_details: {...error}});
    }
}


const UpdatingProfileData = async (req, res) => {
    try {
        const {_id} = req.user;
        // if(req.body.password || req.body.password !== '') {

        // }
        const {firstname, lastname, middlename, email, phone, password} = req.body;
        const datas = {
            firstname, lastname, middlename, email, password: password == '' ? undefined : await hashPass(password),
            details: {
                phone,
                avatar: req.user.details.avatar
            }
        }
        let userResponse = await UserClass.updateProfile(_id, datas);
        if(userResponse) {
            // let user = await UserClass.userFindById(_id);
            return res.status(200).json({message: 'Profile Update Success', user: userResponse});
        }
        return res.status(400).json({message: 'Profile Update Failed.Please Try Again', user});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Profile Update Failed. Server Error.', error_details: {...error}});
    }
}


const UpdatingProfileVatar = async (req, res) => {
    try {
        const {_id, email} = req.user;
        const {avatar} = req.body;
        if(!isBase64(avatar, {mimeRequired: true})) {
            return res.status(400).json({message: 'The Avatar are invalid format'});
        }

        let response = await UserClass.updateProfileAvatar(_id, avatar);
        if(!response) {
            return res.status(400).json({message: 'Profile Avatar Update Failed.'});
        }
        let user = await UserClass.findByEmailUser(email);
        return res.status(200).json({message: 'Profile Update Avatar Complete', user});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Profile Update Failed. Server Error.', error_details: {...error}});
    }
}

const UpdatingWarning = async (req, res) => {
    try {
        const {id_user} = req.params;
        let user = await UserClass.userResetWarning(id_user);
        if(!user) {
            return res.status(400).json({message: 'User Warning Details Update Failed.'});
        }
        user = await UserClass.findByEmailUser(user.email);
        return res.status(200).json({message: 'User Warning Details Complete', user});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'User Warning Details Failed. Server Error.', error_details: {...error}});
    }
}


module.exports = {
    RegisterUser,
    LoginUser,
    LogOutUser,
    autheticate,
    dashBoardDatas,
    SearchUsers,
    ListUsers,
    UpdatingProfileData,
    UpdatingProfileVatar,
    RegisterNewUser,
    fetchUser,
    UpdatingWarning,
    checkEmailResetPass,
    processResetPass
}