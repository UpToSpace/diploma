const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    user: { type: Types.ObjectId, ref: 'User' },
    last4: { type: String, required: true },
    stripeCustomerId: { type: String, required: true }
});

module.exports = model('CreditCard', schema);