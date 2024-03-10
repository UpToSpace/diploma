const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    creditCard: { type: Types.ObjectId, ref: 'CreditCard' },
    route: { type: Types.ObjectId, ref: 'Route' },
    purchaseDate: { type: Date, default: Date.now },
    cost: { type: Number, required: true },
    seat: { type: String, required: true },
});

module.exports = model('Ticket', schema);