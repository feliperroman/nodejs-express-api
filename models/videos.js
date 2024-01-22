const mongoose = require('mongoose');

const videosSchema = mongoose.Schema({
    link: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Videos', videosSchema);