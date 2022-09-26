const { check, body} = require('express-validator');
const isBase64 = require('is-base64');


const isUppercaseValidate = (input) => {
    let letters = input.split('');
    let response = false;
    let format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    letters.forEach((letter) => {
        if(!Number(letter) && !format.test(letter) && letter.toUpperCase() === letter) {
            response = true;
        }
    });
    return response;
}

const isLowerercaseValidate = (input) => {
    let letters = input.split('');
    let response = false;
    letters.forEach((letter) => {
        if(!Number(letter) && letter.toLowerCase() === letter) {
            response = true;
        }
    });
    return response;
}

const hasNumber = (input) => {
    let letters = input.split('');
    let response = false;
    letters.forEach((letter) => {
        if(Number(letter)) {
            response = true;
        }
    });
    return response;
}

const hasSpecialCharacter = (input) => {
    let format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    return format.test(input) ? true : false;
}





const email = check('email').isEmail().withMessage('is Invalid format');
const password = body('password').trim()
    .isLength({ min: 8, max: 15 }).withMessage('Must be 8 minimum & maximum 15 characters.');
//     .custom((value) => {
//         if(!isUppercaseValidate(value)) {
//             throw new Error('must one have Uppercase letter')
//         } 
//         return true
//     })
//     .custom((value) => {
//     if(!isLowerercaseValidate(value)) {
//         throw new Error('must one have Lowercase letter')
//     }
//     return true
// });

const firstname = body('firstname').notEmpty();
const lastname = body('lastname').notEmpty();
const middlename = body('middlename').notEmpty();
const phone = body('phone').escape()
// .exists({checkFalsy: true})
.isLength({min: 11, max:13}).withMessage('is minimum 11 number and maximum 11 to 13')
.matches(/^(09|\+639)\d{9}$/).withMessage('invalid format. ex: 09/+639');

// const avatar = body('avatar').notEmpty().isImage();
const avatar2 = check('avatar')
.custom((value, {req}) => {
        const extension = req.file.mimetype.split('/')[1];
        // if(req.files.mimetype === 'application/pdf'){
        //     return '.pdf'; // return "non-falsy" value to indicate valid data"
        // }else{
        //     return false; // return "falsy" value to indicate invalid data
        // }

        // const extension = (path.extname(filename)).toLowerCase();
        switch (extension) {
            case 'jpg':
                return '.jpg';
            case 'jpeg':
                return '.jpeg';
            case  'png':
                return '.png';
            default:
                return false;
        }
    })
.withMessage('Please only submit Image File.');



//books
const title = body('title').notEmpty();
const isbn = body('isbn').notEmpty();
const author = body('author').notEmpty();
const status = body('status').notEmpty();
const categories = body('categories').isLength({min: 1});
const copies = body('copies').notEmpty();
const image = body('image').notEmpty().custom((value) => {
    console.log(value);
    return true
});;

const user = body('user').notEmpty().withMessage('is required').isObject().withMessage('is invalid format');
const book = body('book').notEmpty().withMessage('is required').isObject().withMessage('is invalid format');
const due_date = body('due_date').notEmpty().withMessage('is required');

const avatar = body('avatar').notEmpty().custom((value) => {
    if(!isBase64(value, {mimeRequired: true})) {
        throw new Error('is invalid format')
    }
    return true;
});

const password2 = body('password').trim()
    .isLength({ min: 8, max: 15 }).withMessage('must be minimum 8 & maximum 15 characters.')
    // .custom((value) => {
    //     if(!isUppercaseValidate(value)) {
    //         throw new Error('must contain at least one Uppercase letter')
    //     } 
    //     return true
    // })
    // .custom((value) => {
    //     if(!isLowerercaseValidate(value)) {
    //         throw new Error('must contain at least one Lowercase letter')
    //     }
    //     return true
    // })
    .optional({ nullable: true, checkFalsy: true});
const password3 = body('password').notEmpty().trim()
.isLength({ min: 8, max: 15 }).withMessage('Must be 8 minimum & maximum 15 characters.');

const role = body('role').notEmpty().withMessage('is required');

const passwordUppercase = body('password').custom((value) => {
    if(!isUppercaseValidate(value)) {
        throw new Error('must contain at least one Uppercase letter')
    } 
    return true
})

const passwordLowercase = body('password').custom((value) => {
    if(!isLowerercaseValidate(value)) {
        throw new Error('must contain at least one Lowercase letter')
    }
    return true
})

const passwordHasNum = body('password').custom((value) => {
    if(!hasNumber(value)) {
        throw new Error('must contain at least one number')
    }
    return true
})
    

                                                            //avatar2,
const registerValidation = [firstname, lastname, middlename, phone,  email, 
    password, passwordUppercase, passwordLowercase, passwordHasNum, avatar];
const registerNewUserValidation = [firstname, lastname, middlename, phone,  email, password3, avatar, role];
const profileUpdateValidate = [firstname, lastname, middlename, phone, email, password2];

const bookRegister = [title, isbn, author, categories, copies, image];
const bookUpdatingValidate = [title, isbn, author, categories, copies];
const bookBorrowedValidate = [user, book, due_date];
const AvatarValidate = [avatar];

const resetPassValidate = [password,passwordUppercase, passwordLowercase, passwordHasNum];


// app.post('/user', body('passwordConfirmation').custom((value, { req }) => {
//     if (value !== req.body.password) {
//       throw new Error('Password confirmation does not match password');
//     }
//   }), (req, res) => {
//     // Handle the request
//   });

module.exports = {
    registerValidation,
    bookRegister,
    bookUpdatingValidate,
    bookBorrowedValidate,
    profileUpdateValidate,
    AvatarValidate,
    registerNewUserValidation,
    resetPassValidate
}