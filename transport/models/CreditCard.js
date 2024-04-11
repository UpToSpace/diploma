const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    user: { type: Types.ObjectId, ref: 'User' },
    cardToken: { type: String, required: true },
    cardNumber: { type: String, required: true }
});

module.exports = model('CreditCard', schema);