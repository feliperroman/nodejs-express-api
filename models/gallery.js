const mongoose = require('mongoose');

const invoicesSchema = mongoose.Schema({
    image_url: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        default: 'gallery'
    },
});

module.exports = mongoose.model('Gallery', invoicesSchema);