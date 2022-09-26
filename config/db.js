const mongoose = require('mongoose');

const connectDb = async () => {
    return await mongoose.connect(`mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.r67zuve.mongodb.net/?retryWrites=true&w=majority`,
    {useNewUrlParser: true, useUnifiedTopology: true});
}

module.exports = {
    connectDb
};