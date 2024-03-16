const mongoose = require('mongoose');

const videosSchema = mongoose.Schema({
    link: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String, default: 'active'
    }
});

module.exports = mongoose.model('Videos', videosSchema);