const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    userId: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    stripeCustomerId: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = model('Customer', schema);
