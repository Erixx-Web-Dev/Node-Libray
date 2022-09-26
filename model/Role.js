const { Schema, model } = require('mongoose');

const roleSchema = new Schema({
  name: {type: String, required: true }, // String is shorthand for {type: String}
});

module.exports = model('Role', roleSchema);