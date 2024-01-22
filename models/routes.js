const mongoose = require('mongoose');
require('./clients')

const routesSchema = mongoose.Schema({
    title: String,
    preview_description: String,
    description: String,
    km: String,
    location: String,
    dates: Array,
    quantity_persons: String,
    images: Array,
    level: String,
    price: Number,
    status: String,
    quota_status: String,
    date_end: Date,
    packages: Array,
    includes: Array,
    prebook: { type: Boolean, default: false },
    percentage_prebook: Number,
    prebooked_assistants: [
        {
            client: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'Clients', autopopulate: true },
            package: { type: Object },
            date_booked: { type: Date, default: Date.now() }
        }
    ],
    assistants: [
        {
            client: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'Clients', autopopulate: true },
            package: { type: Object },
            date_booked: { type: Date, default: Date.now() },
            is_prebook: { type: Boolean, default: false }

        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    deleted: { type: Boolean, default: false },
    category: { type: String }
});

routesSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Routes', routesSchema);