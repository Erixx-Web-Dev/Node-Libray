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
const whitelist = ["https://library-system-react.vercel.app"]
const corsOptions = {
  // origin: function (origin, callback) {
  //   if(!origin) return callback(null, true);
  //   console.log(origin);
  //   if (whitelist.indexOf(origin) === -1) {
  //     console.log(whitelist.indexOf(origin) === -1)
  //     return callback(new Error("Not allowed by CORS"), false)
  //   } 
  //   return callback(null, true)
  // },
  origin: whitelist,
  credentials: true,
}
app.use(cors(corsOptions));
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
