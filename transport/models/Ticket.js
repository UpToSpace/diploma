const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    user: { type: Types.ObjectId, ref: 'User' },
    route: { type: Types.ObjectId, ref: 'Route' },
    purchaseDate: { type: Date, default: Date.now },
    cost: { type: Number, required: true },
    seat: { type: String, required: true },
    chargeId: { type: String, required: true },
});

module.exports = model('Ticket', schema);