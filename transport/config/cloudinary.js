const cloudinary = require('cloudinary').v2;
const config = require('config');

cloudinary.config({
    cloud_name: config.get('cloudinaryCloudName'),
    api_key: config.get('cloudinaryApiKey'),
    api_secret: config.get('cloudinaryApiSecret'),
});

module.exports = cloudinary;