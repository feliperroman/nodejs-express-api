const mongoose = require('mongoose');
require('./clients')
// require('./transactions_clients')

const walletClientsSchema = mongoose.Schema({
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', autopopulate: true },
    client_document: {type: String},
    // // tokens: { type: Number, default: 0 },
    // transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'transactions_clients', autopopulate: true }],
    // payment_sources_wompi: { type: Array },
    operations_wompi: { type: Array }
});

module.exports = mongoose.model('wallet_clients', walletClientsSchema);
