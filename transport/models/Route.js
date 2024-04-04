const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    transport: { type: Types.ObjectId, ref: 'Transport' },
    departure: { type: Object, required: true },
    destination: { type: Object, required: true },
    price: { type: Number, required: true },
});

module.exports = model('Route', schema);