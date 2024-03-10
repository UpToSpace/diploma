const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    user: { type: Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    cartNumber: { type: String, required: true },
    expirationDate: { type: String, required: true },
    cvv: { type: String, required: true },
});

module.exports = model('CreditCard', schema);