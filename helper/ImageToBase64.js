const fs = require('fs');

// Helper function
const base64_encode_image = (file) => {
    // return "data:image/gif;base64," + fs.readFileSync(file, 'base64');
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(bitmap).toString('base64');
}

module.exports = {
    base64_encode_image
}