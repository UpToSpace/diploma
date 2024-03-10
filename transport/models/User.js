const { Schema, model, Types } = require('mongoose');

const schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    refreshToken: { type: String },
    refreshLink: { type: String },
    fullName: { type: String, required: true },
    address: { type: String, required: false },
    dateOfRegistration: { type: Date, default: Date.now },
    dateOfBirth: { type: Date, required: false }
});

module.exports = model('User', schema);