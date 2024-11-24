const jwt = require('jsonwebtoken');
const User = require('../models/User');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "24h" });
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(id, refreshToken) {
        const tokenData = await User.findOne({ _id: id });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await User.updateOne({ _id: id }, { $set: { refreshToken } });
        return token;
    }
}

module.exports = new TokenService();