const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    carrier: { type: Types.ObjectId, ref: 'User' },
    number: { type: String, required: true, unique: true},
    brand: { type: String, required: true },
    model: { type: String, required: true },
    yearOfBuild: { type: Number, required: true },
    capacity: { type: Number, required: true },
    seatsLayout: { type: Object, required: true },
});

module.exports = model('Transport', schema);