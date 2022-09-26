const {Router} = require('express');
const { RegisterUser, LoginUser, LogOutUser, autheticate, checkEmailResetPass, processResetPass } = require('../controller/UserController');
const { registerValidation, resetPassValidate } = require('../helper/Validation');
const { handleErrors } = require('../helper/Validator-Error');
const multer = require('multer');
const { imageValidate } = require('../middleware/ImageValidate');
const { protect } = require('../middleware/authmiddleware');
const { refreshAthorization } = require('../middleware/refreshTokenMiddleware');
const upload = multer();
const router = Router();
const Role = require('../model/Role');


// router.post('/sign-in', (req, res) => {
//     return res.send('Auth');
// });

// upload.none() -> to process form data type. but not image 
// router.post('/sign-up', upload.none(), registerValidation, handleErrors, RegisterUser);

// router.post('/sign-up', upload.single('avatar'), registerValidation, handleErrors, RegisterUser);
router.post('/sign-up', upload.none(), registerValidation, handleErrors, RegisterUser);
router.post('/sign-in', LoginUser);
router.get('/user-me', protect, (req, res) => {
    return res.status(200).json({user: req.user});
});
router.get('/role-list', protect, async (req, res) => {
    try {
        let roles = await Role.find();
        return res.status(200).json({message: 'Register Complete', roles});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Cannot Fetch Role List. Server Error.', error_details:{...error}});
    }
});

router.get('/refresh-authetication', refreshAthorization);
router.post('/logout', protect, LogOutUser);
router.post('/logout-force/backup-route', LogOutUser);// force logout wihtout middleware

router.get('/user-authenticate', autheticate); // autheticate check if auth_toekn then refresh token if needed. then return user data

router.post('/user/reset-password/request', checkEmailResetPass);
router.post('/user/reset-password/submit', resetPassValidate, handleErrors, processResetPass);
// forget Password

module.exports = router;