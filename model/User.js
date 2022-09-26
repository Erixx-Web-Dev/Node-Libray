const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  firstname: {type: String, required: true }, // String is shorthand for {type: String}
  lastname: {type: String, required: true}, 
  middlename: {type: String, required: true}, 
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  details: {
    avatar: {type: String},
    phone: {type: String}
  },
  role: [
    {type: Schema.Types.ObjectId, ref: 'Role'}
  ],
  token: {
    value: {type: String, unique: true},
    expires: {type: Date},
  },
  warning: {type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = model('User', userSchema);