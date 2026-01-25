const mongoose = require('mongoose');

/**
 * Counter Schema for atomic daily queue number generation
 * _id format: "<orderDate>|<timezone>"
 * Example: "2026-01-22|Europe/Berlin"
 */
const counterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Counter', counterSchema);
