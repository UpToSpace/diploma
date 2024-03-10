const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    routeId: { type: Types.ObjectId, ref: 'Route' },
    userId: { type: Types.ObjectId, ref: 'User' }
});

module.exports = model('Favourite', schema);