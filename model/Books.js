const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
    title: {type: String, required: true},
    isbn: {type: String, required: true}, // String is shorthand for {type: String}
    // category
    author: {type: String, required: true}, 
    status: { 
        type: String,
        enum: [ 'available', 'unavailable' ],
        default: 'available'
    },
    categories: { 
        type: [String],
        required: true
        // Math, Science, English, Physic, Biology, History, P.E, Sports and leisure, 
    },
    copies: { type: Number, required: true },
    image: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date}
});

module.exports = model('Book', bookSchema);