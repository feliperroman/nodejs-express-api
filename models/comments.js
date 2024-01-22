const mongoose = require('mongoose');

const commentsSchema = mongoose.Schema({
    image_url: String,
    name: String,
    comment: String,
    rating: {type: Number, default: 5},
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Comments', commentsSchema);