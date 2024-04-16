const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    user: { type: Types.ObjectId, ref: 'User' },
    route: { type: Types.ObjectId, ref: 'Route' },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    rating: { type: Number, required: true },
});

module.exports = model('Review', schema);