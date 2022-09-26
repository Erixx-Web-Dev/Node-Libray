const { Schema, model } = require('mongoose');

const loanSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true}, // String is shorthand for {type: String}
    book: {type: Schema.Types.ObjectId, ref: 'Book', required: true}, 
    status: { 
        type: String,
        // reserve
        // minus copies -> status not return if confirm by librarian
        enum : ['return','not return'],
        default: 'not return'
    },
    issue_date: { type: Date, default: Date.now },
    due_date: { type: Date },
    return_date: { type: Date },
});

module.exports = model('Loan', loanSchema);