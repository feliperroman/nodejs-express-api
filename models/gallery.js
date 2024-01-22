const mongoose = require('mongoose');

const invoicesSchema = mongoose.Schema({
    image_url: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Gallery', invoicesSchema);