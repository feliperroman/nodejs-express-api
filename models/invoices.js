const mongoose = require('mongoose');
require('./clients')
require('./routes')

const invoicesSchema = mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'Clients', autopopulate: true },
    route: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'Routes', autopopulate: true },
    is_prebook: { type: Boolean, default: false },
    paid: { type: Boolean, default: false },
    mail: { type: Boolean, default: false },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Invoices', invoicesSchema);