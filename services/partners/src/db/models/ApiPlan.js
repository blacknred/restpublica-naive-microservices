const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ApiPlan = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    limit: {
        type: Number,
        min: 50,
        index: true,
        unique: true,
        required: true
    },
    price: {
        type: Number,
        min: 0,
        index: true,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('ApiPlan', ApiPlan);

