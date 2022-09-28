const express = require('express');
const multer = require('multer');
require('dotenv').config();
const app = express();
const { connectDb } = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const patch = require('path')


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended:false}));

// const expressValidator = require('express-validator');
// //the app use part
// app.use(expressValidator({
// customValidators: {
//     isImage: function(value, filename) {

//         const extension = (path.extname(filename)).toLowerCase();
//         switch (extension) {
//             case '.jpg':
//                 return '.jpg';
//             case '.jpeg':
//                 return '.jpeg';
//             case  '.png':
//                 return '.png';
//             default:
//                 return false;
//         }
//     }
// }}));

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }))
// // parse application/json
// app.use(bodyParser.json())
const whitelist = ["https://library-system-react.vercel.app"];
// const corsOptions = {
    // origin: function (origin, callback) {
    //     if (!origin || whitelist.indexOf(origin) !== -1) {
    //         callback(null, true)
    //     } else {
    //         callback(new Error("The domain was not allowed by CORS"), false)
    //     }
    // },
   // origin: true,
//     credentials: true,
//     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke
// }
const corsAsync = function (req, callback) {
    let corsOptions = { origin: false };
    const origin = req.header('Origin');
    if (!origin || whitelist.indexOf(origin) !== -1) {
        corsOptions = { origin: true };
    }
    callback(null, { ...corsOptions, credentials: true, optionsSuccessStatus: 200});
}

app.use(cors(corsAsync));
app.use(cookieParser());

app.use('/api/library-system/backend', require('./routes/auth'));
app.use('/api/library-system/backend/admin', require('./routes/user'));
app.use('/api/library-system/backend/admin/book', require('./routes/book'));
app.use('/api/library-system/backend/loan', require('./routes/loan'));

app.get('/api/*', (req, res) => {
    return res.status(404).json({message: 'Route not Found.'});
});

app.get('/*', (req, res) => {
    return res.status(404).json({message: 'Route not Found.'});
});

app.use(errorHandler);
const runApplication = async () => {
    try {
        await connectDb();
        app.listen(process.env.PORT);
        console.log('App Running at PORT:', process.env.PORT);
    } catch (error) {
        console.log(error?.message);
        console.log(error?.codeName);
        await runApplication();
    }
}



runApplication();
