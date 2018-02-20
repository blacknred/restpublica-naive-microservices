const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PartnerApp = new Schema({
    apiKey: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    planId: { type: Number, required: true, index: true, ref: 'ApiPlan' },
    adminId: { type: Number, required: true, index: true },
    domain: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
        match: /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
        match: /^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9\\-\\.]+)\\.([a-zA-Z]{2,5})$/
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PartnerApp', PartnerApp);

