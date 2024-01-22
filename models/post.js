const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: String,
    descripcion: String,
    links: Array,
    image_p: String,
    images: Array,
    status: String,
    type: String,
    deleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Post', postSchema);