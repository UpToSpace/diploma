const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    transport: { type: Types.ObjectId, ref: 'Transport' },
    departure: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    price: { type: Number, required: true },
});

module.exports = model('Route', schema);