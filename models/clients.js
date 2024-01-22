const mongoose = require('mongoose');

const clientsSchema = mongoose.Schema({
    document     : String,
    type_document: String,
    first_name   : String,
    last_name    : String,
    phone_number : String,
    email        : String,
    rh           : String,
    eps          : String,
    status       : String,
    health_observations : String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    deleted: { type: Boolean, default: false},
    routes_prebooked: Array
});

module.exports = mongoose.model('Clients', clientsSchema);